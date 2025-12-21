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

/**
 * Check if a system has a logistics center building
 */
function hasLogisticsCenter(system) {
  if (system.owner !== 'Player') return false;
  const logisticsCenterLevel = system.buildings?.logisticsCenter?.level || 0;
  return logisticsCenterLevel > 0;
}

/**
 * Build an adjacency graph of FTL connections between systems
 * @param {Array} routes - Galaxy routes
 * @param {Set} builtFTLSet - Set of built FTL route IDs
 * @returns {Map<number, Set<number>>} - Map of system ID to set of connected system IDs
 */
function buildFTLGraph(routes, builtFTLSet) {
  const graph = new Map();

  for (const route of routes) {
    const routeId = route.id;
    if (!builtFTLSet.has(routeId)) continue;

    const sourceId = route.source.id;
    const targetId = route.target.id;

    if (!graph.has(sourceId)) graph.set(sourceId, new Set());
    if (!graph.has(targetId)) graph.set(targetId, new Set());

    graph.get(sourceId).add(targetId);
    graph.get(targetId).add(sourceId);
  }

  return graph;
}

/**
 * Find paths from producer to consumer through logistics centers using BFS
 * @param {number} producerId - Source system ID
 * @param {number} consumerId - Destination system ID
 * @param {Map<number, Set<number>>} graph - FTL connection graph
 * @param {Map<number, Object>} systemMap - Map of system ID to system object
 * @returns {Array<Array<number>>} - Array of paths (each path is array of system IDs)
 */
function findLogisticsPaths(producerId, consumerId, graph, systemMap) {
  // BFS to find all paths (unlimited hops through logistics centers)
  const paths = [];
  const queue = [[producerId]]; // Queue of paths
  const maxPathLength = 10; // Safety limit to prevent infinite loops

  while (queue.length > 0) {
    const currentPath = queue.shift();
    const currentSystem = currentPath[currentPath.length - 1];

    // If we reached the consumer, save this path
    if (currentSystem === consumerId) {
      paths.push(currentPath);
      continue;
    }

    // Safety check: don't explore paths that are too long
    if (currentPath.length >= maxPathLength) continue;

    // Explore neighbors
    const neighbors = graph.get(currentSystem) || new Set();
    for (const neighborId of neighbors) {
      // Avoid cycles
      if (currentPath.includes(neighborId)) continue;

      // Check if this is a valid relay point (must have logistics center)
      // Exception: direct connection (no relay needed) or final destination
      if (currentPath.length > 0 && neighborId !== consumerId) {
        const neighborSystem = systemMap.get(neighborId);
        if (!neighborSystem || !hasLogisticsCenter(neighborSystem)) {
          continue; // Skip this neighbor if it's not a logistics hub
        }
      }

      queue.push([...currentPath, neighborId]);
    }
  }

  return paths;
}

export function computeTradeFlows(galaxy, builtFTLSet) {
  if (!galaxy.systems.length || builtFTLSet.size === 0) {
    return {
      flows: [],
      systemSatisfaction: new Map(),
      routeThroughput: new Map(),
      routePaths: new Map() // Map of routeId to path segments
    };
  }

  const producers = [];
  const consumers = [];

  for (const system of galaxy.systems) {
    // Supply comes from oreMine buildings (Player-owned systems only)
    const production = getSystemSupply(system);

    // Demand comes from static market data
    const demand = system.market?.metals?.demand || 0;

    // Local production satisfies local demand first
    const localConsumption = Math.min(production, demand);
    const surplus = production - localConsumption;
    const unmetDemand = demand - localConsumption;

    // Only export surplus production (after satisfying local demand)
    if (surplus > 0) {
      producers.push({ id: system.id, supply: surplus });
      console.log(`📦 Producer found: ${system.name} (ID:${system.id}) - Surplus: ${surplus} (Production: ${production}, Local Use: ${localConsumption})`);
    }

    // Only import if demand exceeds local production
    if (unmetDemand > 0) {
      consumers.push({ id: system.id, demand: unmetDemand });
      console.log(`🏭 Consumer found: ${system.name} (ID:${system.id}) - Unmet Demand: ${unmetDemand} (Total Demand: ${demand}, Local Production: ${localConsumption})`);
    }
  }

  // Create a map for quick system lookup
  const systemMap = new Map(galaxy.systems.map(s => [s.id, s]));

  // Build FTL graph for pathfinding
  const ftlGraph = buildFTLGraph(galaxy.routes, builtFTLSet);

  const links = [];
  const routePaths = new Map(); // Track multi-hop paths

  // Find all possible producer-consumer connections (direct and multi-hop)
  for (const producer of producers) {
    for (const consumer of consumers) {
      if (producer.id === consumer.id) continue;

      // Find all paths from producer to consumer
      const paths = findLogisticsPaths(producer.id, consumer.id, ftlGraph, systemMap);

      for (const path of paths) {
        if (path.length < 2) continue; // Need at least 2 nodes (start and end)

        // Create a link for this path
        const linkKey = `${producer.id}->${consumer.id}-path${paths.indexOf(path)}`;
        links.push({
          producerId: producer.id,
          consumerId: consumer.id,
          linkKey,
          path // Store the full path for animation later
        });

        // Store path segments for each FTL route involved
        for (let i = 0; i < path.length - 1; i++) {
          const fromId = path[i];
          const toId = path[i + 1];

          // Find the route ID for this segment
          const route = galaxy.routes.find(r =>
            (r.source.id === fromId && r.target.id === toId) ||
            (r.target.id === fromId && r.source.id === toId)
          );

          if (route) {
            if (!routePaths.has(route.id)) {
              routePaths.set(route.id, []);
            }
            routePaths.get(route.id).push({
              from: fromId,
              to: toId,
              producerId: producer.id,
              consumerId: consumer.id,
              pathIndex: i,
              pathLength: path.length - 1
            });
          }
        }

        const producerSystem = systemMap.get(producer.id);
        const consumerSystem = systemMap.get(consumer.id);
        const pathStr = path.map(id => systemMap.get(id)?.name || id).join(' → ');
        console.log(`🔗 Link created: ${producerSystem.name} → ${consumerSystem.name} via ${pathStr}`);
      }
    }
  }

  console.log(`💼 Trade summary: ${producers.length} producers, ${consumers.length} consumers, ${links.length} links`);

  if (producers.length === 0 || consumers.length === 0 || links.length === 0) {
    console.log(`❌ No trade flows: missing ${producers.length === 0 ? 'producers ' : ''}${consumers.length === 0 ? 'consumers ' : ''}${links.length === 0 ? 'links' : ''}`);
    return {
      flows: [],
      systemSatisfaction: new Map(),
      routeThroughput: new Map(),
      routePaths: new Map()
    };
  }

  const result = satisfyDemands({ producers, consumers, links });
  console.log(`✅ Trade flows computed:`, result.flows);

  const systemSatisfaction = new Map();

  // Track export data for producers
  for (const producer of producers) {
    const sent = result.producerSent.get(producer.id) || 0;
    const existing = systemSatisfaction.get(producer.id) || {};
    systemSatisfaction.set(producer.id, {
      ...existing,
      exported: sent,
      totalSupply: producer.supply,
      supplyRatio: producer.supply > 0 ? sent / producer.supply : 0
    });
  }

  // Track import data for consumers (may merge with existing producer data)
  for (const consumer of consumers) {
    const received = result.consumerReceived.get(consumer.id) || 0;
    const existing = systemSatisfaction.get(consumer.id) || {};
    systemSatisfaction.set(consumer.id, {
      ...existing,
      satisfied: received,
      totalDemand: consumer.demand,
      demandRatio: consumer.demand > 0 ? received / consumer.demand : 0
    });
  }

  const routeThroughput = new Map();
  for (const flow of result.flows) {
    if (flow.amount > 0) {
      const link = links.find(l =>
        l.producerId === flow.producerId && l.consumerId === flow.consumerId
      );
      if (link && link.path) {
        // For multi-hop paths, distribute flow across all segments
        for (let i = 0; i < link.path.length - 1; i++) {
          const fromId = link.path[i];
          const toId = link.path[i + 1];

          // Find the route ID for this segment
          const route = galaxy.routes.find(r =>
            (r.source.id === fromId && r.target.id === toId) ||
            (r.target.id === fromId && r.source.id === toId)
          );

          if (route) {
            const existing = routeThroughput.get(route.id) || 0;
            routeThroughput.set(route.id, existing + flow.amount);
          }
        }
      }
    }
  }

  return {
    flows: result.flows,
    systemSatisfaction,
    routeThroughput,
    routePaths // Include routing paths for animation
  };
}
