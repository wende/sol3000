export function migrateRouteIds(galaxyData, builtFTLs) {
  if (builtFTLs.length === 0) return { galaxyData, builtFTLs };

  const oldToNew = new Map();
  const systems = galaxyData.systems;

  systems.forEach((sys, idx) => {
    sys.__tempIdx = idx;
  });

  let needsMigration = false;
  const updatedRoutes = galaxyData.routes.map(route => {
    const oldId = [route.source.__tempIdx, route.target.__tempIdx].sort((a, b) => a - b).join('-');
    const newId = [route.source.id, route.target.id].sort((a, b) => a - b).join('-');

    if (oldId !== newId) {
      oldToNew.set(oldId, newId);
      needsMigration = true;
    }

    if (route.id === oldId && oldId !== newId) {
      return { ...route, id: newId };
    }
    return route;
  });

  systems.forEach(sys => delete sys.__tempIdx);

  if (!needsMigration && oldToNew.size === 0) {
    return { galaxyData, builtFTLs };
  }

  const migratedBuiltFTLs = builtFTLs.map(oldId => {
    const newId = oldToNew.get(oldId);
    return newId || oldId;
  });

  return {
    galaxyData: { ...galaxyData, routes: updatedRoutes },
    builtFTLs: migratedBuiltFTLs
  };
}

export function migrateSaveData(galaxyData) {
  const needsMigration = galaxyData.systems.some(s => s.market === undefined);

  if (!needsMigration) {
    return galaxyData;
  }

  const migratedSystems = galaxyData.systems.map(s => {
    if (s.market !== undefined) return s;

    if (Math.random() > 0.55) return { ...s, market: null };

    const bias =
      s.resources === 'Rich' ? 0.12 :
      s.resources === 'Poor' ? -0.12 :
      0;

    const isSupply = Math.random() < Math.min(1, Math.max(0, 0.5 + bias));
    const randomInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

    if (isSupply) {
      return { ...s, market: { metals: { supply: randomInt(200, 1200), demand: 0 } } };
    }

    return { ...s, market: { metals: { supply: 0, demand: randomInt(200, 1200) } } };
  });

  return { ...galaxyData, systems: migratedSystems };
}
