import { satisfyDemands } from '../production';
import { BUILDINGS } from './buildings';

/**
 * Calculate metals supply for a system based on oreMine levels.
 * Player-owned systems get supply from their Metals Extractor buildings.
 */
function getSystemSupply(system) {
  if (system.owner !== 'Player') return 0;

  const oreMineLevel = system.buildings?.oreMine?.level || 0;
  if (oreMineLevel === 0) return 0;

  return oreMineLevel * BUILDINGS.oreMine.supplyPerLevel;
}

export function computeTradeFlows(galaxy, builtFTLSet) {
  if (!galaxy.systems.length || builtFTLSet.size === 0) {
    return {
      flows: [],
      systemSatisfaction: new Map(),
      routeThroughput: new Map()
    };
  }

  const producers = [];
  const consumers = [];

  for (const system of galaxy.systems) {
    // Supply comes from oreMine buildings (Player-owned systems only)
    const supply = getSystemSupply(system);
    if (supply > 0) {
      producers.push({ id: system.id, supply });
      console.log(`📦 Producer found: ${system.name} (ID:${system.id}) - Supply: ${supply}`);
    }

    // Demand comes from static market data
    const demand = system.market?.metals?.demand || 0;
    if (demand > 0) {
      consumers.push({ id: system.id, demand });
      console.log(`🏭 Consumer found: ${system.name} (ID:${system.id}) - Demand: ${demand}`);
    }
  }

  // Create a map for quick system lookup
  const systemMap = new Map(galaxy.systems.map(s => [s.id, s]));

  const links = [];
  for (const route of galaxy.routes) {
    const routeId = route.id;
    if (!builtFTLSet.has(routeId)) continue;

    // Look up fresh system data (route.source/target may be stale)
    const sourceSystem = systemMap.get(route.source.id);
    const targetSystem = systemMap.get(route.target.id);

    if (!sourceSystem || !targetSystem) continue;

    // Supply comes from oreMine buildings
    const sourceSupply = getSystemSupply(sourceSystem);
    const targetSupply = getSystemSupply(targetSystem);

    // Demand comes from market data
    const sourceDemand = sourceSystem.market?.metals?.demand || 0;
    const targetDemand = targetSystem.market?.metals?.demand || 0;

    if (sourceSupply > 0 && targetDemand > 0) {
      links.push({ producerId: sourceSystem.id, consumerId: targetSystem.id, routeId });
      console.log(`🔗 Link created: ${sourceSystem.name} (S:${sourceSupply}) → ${targetSystem.name} (D:${targetDemand})`);
    }
    if (targetSupply > 0 && sourceDemand > 0) {
      links.push({ producerId: targetSystem.id, consumerId: sourceSystem.id, routeId });
      console.log(`🔗 Link created: ${targetSystem.name} (S:${targetSupply}) → ${sourceSystem.name} (D:${sourceDemand})`);
    }
  }

  console.log(`💼 Trade summary: ${producers.length} producers, ${consumers.length} consumers, ${links.length} links`);

  if (producers.length === 0 || consumers.length === 0 || links.length === 0) {
    console.log(`❌ No trade flows: missing ${producers.length === 0 ? 'producers ' : ''}${consumers.length === 0 ? 'consumers ' : ''}${links.length === 0 ? 'links' : ''}`);
    return {
      flows: [],
      systemSatisfaction: new Map(),
      routeThroughput: new Map()
    };
  }

  const result = satisfyDemands({ producers, consumers, links });
  console.log(`✅ Trade flows computed:`, result.flows);

  const systemSatisfaction = new Map();
  for (const producer of producers) {
    const sent = result.producerSent.get(producer.id) || 0;
    systemSatisfaction.set(producer.id, {
      type: 'supply',
      used: sent,
      total: producer.supply,
      ratio: producer.supply > 0 ? sent / producer.supply : 0
    });
  }

  for (const consumer of consumers) {
    const received = result.consumerReceived.get(consumer.id) || 0;
    systemSatisfaction.set(consumer.id, {
      type: 'demand',
      satisfied: received,
      total: consumer.demand,
      ratio: consumer.demand > 0 ? received / consumer.demand : 0
    });
  }

  const routeThroughput = new Map();
  for (const flow of result.flows) {
    if (flow.amount > 0) {
      const link = links.find(l =>
        l.producerId === flow.producerId && l.consumerId === flow.consumerId
      );
      if (link) {
        const existing = routeThroughput.get(link.routeId) || 0;
        routeThroughput.set(link.routeId, existing + flow.amount);
      }
    }
  }

  return {
    flows: result.flows,
    systemSatisfaction,
    routeThroughput
  };
}
