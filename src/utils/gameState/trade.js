import { satisfyDemands } from '../production';

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
    const market = system.market?.metals;
    if (!market) continue;

    if (market.supply > 0) {
      producers.push({ id: system.id, supply: market.supply });
    }
    if (market.demand > 0) {
      consumers.push({ id: system.id, demand: market.demand });
    }
  }

  const links = [];
  for (const route of galaxy.routes) {
    const routeId = route.id;
    if (!builtFTLSet.has(routeId)) continue;

    const sourceMarket = route.source.market?.metals;
    const targetMarket = route.target.market?.metals;

    const sourceHasSupply = (sourceMarket?.supply || 0) > 0;
    const sourceHasDemand = (sourceMarket?.demand || 0) > 0;
    const targetHasSupply = (targetMarket?.supply || 0) > 0;
    const targetHasDemand = (targetMarket?.demand || 0) > 0;

    if (sourceHasSupply && targetHasDemand) {
      links.push({ producerId: route.source.id, consumerId: route.target.id, routeId });
    }
    if (targetHasSupply && sourceHasDemand) {
      links.push({ producerId: route.target.id, consumerId: route.source.id, routeId });
    }
  }

  if (producers.length === 0 || consumers.length === 0 || links.length === 0) {
    return {
      flows: [],
      systemSatisfaction: new Map(),
      routeThroughput: new Map()
    };
  }

  const result = satisfyDemands({ producers, consumers, links });

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
