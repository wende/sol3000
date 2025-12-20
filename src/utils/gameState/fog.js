/**
 * Calculate visible systems based on fog of war (2 hops from all colonized planets)
 * Also returns tether routes (connections from 2-hop systems to unseen 3-hop systems)
 */
export function calculateVisibleSystems(galaxy, homeSystemId) {
  // Note: homeSystemId can be 0 (Sol has id 0), so we must check for null/undefined explicitly
  if (homeSystemId === null || homeSystemId === undefined || !galaxy.systems.length) {
    return { visibleIds: new Set(), tetherRoutes: [] };
  }

  const colonizedSystems = galaxy.systems.filter(s => s.owner === 'Player');
  if (colonizedSystems.length === 0) {
    return { visibleIds: new Set(), tetherRoutes: [] };
  }

  const adjacency = {};
  galaxy.systems.forEach(s => { adjacency[s.id] = []; });
  galaxy.routes.forEach(r => {
    adjacency[r.source.id].push(r.target.id);
    adjacency[r.target.id].push(r.source.id);
  });

  const visibleIds = new Set();
  const queue = [];
  const visited = new Set();

  for (const colonized of colonizedSystems) {
    visibleIds.add(colonized.id);
    visited.add(colonized.id);
    queue.push([colonized.id, 0]);
  }

  while (queue.length > 0) {
    const [currentId, distance] = queue.shift();

    if (distance < 2) {
      const neighbors = adjacency[currentId] || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          visibleIds.add(neighborId);
          queue.push([neighborId, distance + 1]);
        }
      }
    }
  }

  const tetherRoutes = [];
  const distanceMap = new Map();
  const bfsQueue = [];

  for (const colonized of colonizedSystems) {
    distanceMap.set(colonized.id, 0);
    bfsQueue.push([colonized.id, 0]);
  }

  while (bfsQueue.length > 0) {
    const [currentId, distance] = bfsQueue.shift();

    if (distance < 3) {
      const neighbors = adjacency[currentId] || [];
      for (const neighborId of neighbors) {
        if (!distanceMap.has(neighborId)) {
          distanceMap.set(neighborId, distance + 1);
          bfsQueue.push([neighborId, distance + 1]);
        }
      }
    }
  }

  for (const systemId of visibleIds) {
    const distance = distanceMap.get(systemId);
    if (distance !== 2) continue;

    const neighbors = adjacency[systemId] || [];
    for (const neighborId of neighbors) {
      const neighborDistance = distanceMap.get(neighborId);
      if (neighborDistance === 3) {
        const source = galaxy.systems.find(s => s.id === systemId);
        const target = galaxy.systems.find(s => s.id === neighborId);
        if (source && target) {
          tetherRoutes.push({
            source,
            target,
            id: `tether-${systemId}-${neighborId}`
          });
        }
      }
    }
  }

  return { visibleIds, tetherRoutes };
}
