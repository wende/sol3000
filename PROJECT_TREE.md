# PROJECT_TREE.md - Sol3000 Feature & Component Map

## Source File Structure

```
src/
├── App.jsx                      # Root component - view state management, global signals
├── index.jsx                    # Entry point with TreeLocator dev tool
├── components.jsx               # Component showcase/demo page
├── icons.jsx                    # Icon definitions
├── setupTests.js                # Test configuration
│
├── utils/
│   ├── galaxy.js                # Galaxy generation (120 systems, routes, spectral classes)
│   ├── galaxy.test.js
│   ├── ftl.js                   # FTL tether building logic
│   ├── ftl.test.js
│   ├── format.js                # Formatting utilities (time, numbers, rates)
│   ├── production.js            # Resource production calculations
│   ├── production.test.js
│   ├── gameState.js             # Central state management (~450 lines)
│   ├── gameState.test.js
│   ├── gameState.visibility.test.js
│   │
│   └── gameState/               # State modules
│       ├── constants.js         # TICK_INTERVAL, multipliers, STORAGE_KEY
│       ├── buildings.js         # Building definitions & costs
│       ├── tech.js              # Tech tree & bonus calculations
│       ├── fog.js               # Fog of war visibility
│       ├── trade.js             # Trade flow computation
│       └── migrations.js        # Save data migrations
│
├── hooks/
│   └── useZoomableSvg.js        # D3 zoom/pan behavior hook
│
├── operations/
│   └── scan.js                  # Scan operation (costs, duration)
│
├── components/
│   ├── common/                  # Reusable UI (19 files)
│   │   ├── GlassPanel.jsx       # Glassmorphism container
│   │   ├── GlassCard.jsx        # Card variant
│   │   ├── Button.jsx           # Unified button (7 variants)
│   │   ├── Modal.jsx            # Dialog modal
│   │   ├── ProgressBar.jsx      # Progress indicator
│   │   ├── Resource.jsx         # Resource display with rate
│   │   ├── ResourceIcon.jsx     # Resource type icons
│   │   ├── StatBlock.jsx        # Statistics block
│   │   ├── StatLabel.jsx        # Stat label
│   │   ├── BuildingIcon.jsx     # Building icons
│   │   ├── BuildingConstruct.jsx # 5x5 CSS grid building visual
│   │   ├── PlanetConstruct.jsx  # Planet hex visualization
│   │   ├── BackgroundGrid.jsx   # Animated background
│   │   ├── VignetteOverlay.jsx  # Vignette effect
│   │   ├── BlackHole.jsx        # Black hole center
│   │   ├── GravitationalLens.jsx # Lensing effect
│   │   ├── StartGameButton.jsx  # Game start UI
│   │   ├── DemoContainer.jsx    # Demo wrapper
│   │   └── MiniPanel.jsx        # Small utility panel
│   │
│   └── game/                    # Game-specific (33 files)
│       ├── GalaxyMap.jsx        # D3-powered SVG map (~500 lines)
│       ├── Star.jsx             # Star rendering
│       ├── StarSystem.jsx       # System with selection ring
│       ├── FTLRoute.jsx         # Route/tether visualization
│       ├── FTLTethers.jsx       # Route collection
│       ├── SystemView.jsx       # System detail view
│       ├── SystemProgressRing.jsx # Scan progress ring
│       ├── SystemOverviewPanel.jsx # System info panel
│       ├── SystemStatsGrid.jsx  # System stats grid
│       ├── Sidebar.jsx          # Right-side details panel
│       ├── SidebarHeader.jsx    # Sidebar header
│       ├── TetherInfoPanel.jsx  # Tether info panel
│       ├── DestinationSelector.jsx # Ship destination UI
│       ├── DockedShipCard.jsx   # Docked ship display
│       ├── TransitShipCard.jsx  # In-transit ship display
│       ├── BuildingList.jsx     # Building management
│       ├── Buildings.jsx        # Building interface
│       ├── BuildingIconShowcase.jsx # Demo showcase
│       ├── HexGrid.jsx          # Planet hex grid
│       ├── HexBuildingMenu.jsx  # Building menu for hex
│       ├── ConstructionQueueItem.jsx # Queue item
│       ├── VoidConstructStation.jsx # Void construct
│       ├── ResourceStat.jsx     # Resource stat display
│       ├── ResourceIconShowcase.jsx # Demo showcase
│       ├── MarketBadge.jsx      # Trade indicator
│       ├── EnergyStat.jsx       # Energy display
│       ├── CommandBar.jsx       # Bottom action bar
│       ├── StatsPanel.jsx       # Top-left global stats
│       ├── TechListItem.jsx     # Tech tree item
│       └── TetherFlowShowcase.jsx # Trade flow demo
```

---

## Component Dependency Map

### App.jsx (Root)
```
App.jsx
├── utils/gameState.js → createGameState()
├── components/game/GalaxyMap.jsx
├── components/game/SystemView.jsx
├── components/game/HexGrid.jsx
├── components/game/HexBuildingMenu.jsx
├── components/game/Sidebar.jsx
├── components/game/CommandBar.jsx
├── components/game/StatsPanel.jsx
├── components/common/BackgroundGrid.jsx
├── components/common/StartGameButton.jsx
└── components/common/VignetteOverlay.jsx
```

### GalaxyMap.jsx
```
GalaxyMap.jsx
├── d3 (external)
├── hooks/useZoomableSvg.js
├── components/game/FTLTethers.jsx
│   └── components/game/FTLRoute.jsx
├── components/game/StarSystem.jsx
│   └── components/game/Star.jsx
└── utils/galaxy.js (constants)
```

### Sidebar.jsx
```
Sidebar.jsx
├── components/common/GlassPanel.jsx
├── components/game/SidebarHeader.jsx
├── components/game/SystemOverviewPanel.jsx
├── components/game/TetherInfoPanel.jsx
├── components/game/DestinationSelector.jsx
├── components/game/DockedShipCard.jsx
└── components/game/TransitShipCard.jsx
```

### SystemView.jsx
```
SystemView.jsx
├── components/common/GlassPanel.jsx
├── components/common/Button.jsx
├── components/game/Star.jsx (getStarColor)
├── components/game/SystemProgressRing.jsx
├── components/game/BuildingList.jsx
│   ├── components/common/GlassPanel.jsx
│   ├── components/common/Button.jsx
│   ├── components/common/BuildingIcon.jsx
│   └── components/common/ProgressBar.jsx
├── components/common/PlanetConstruct.jsx
└── utils/galaxy.js (SPECTRAL_CLASSES)
```

### CommandBar.jsx
```
CommandBar.jsx
├── components/common/GlassPanel.jsx
├── components/common/Modal.jsx
├── components/common/Button.jsx
├── components/game/TechListItem.jsx
├── components/game/DockedShipCard.jsx
├── components/game/TransitShipCard.jsx
└── utils/gameState/tech.js (TECH_TREE)
```

### Common Components (No Internal Dependencies)
```
Button.jsx      → lucide-solid icons only
GlassPanel.jsx  → standalone
Modal.jsx       → GlassPanel, lucide-solid icons
ProgressBar.jsx → standalone
Resource.jsx    → ResourceIcon, utils/format.js
```

---

## Feature Location Map

| Feature | Primary Files | Description |
|---------|--------------|-------------|
| **Galaxy Generation** | `utils/galaxy.js` | 120 systems, 8 spectral classes, route generation |
| **Galaxy Rendering** | `game/GalaxyMap.jsx`, `game/Star.jsx`, `game/StarSystem.jsx` | D3 zoom/pan, SVG rendering |
| **Fog of War** | `utils/gameState/fog.js`, `game/GalaxyMap.jsx` | 2-hop visibility from colonies |
| **System View** | `game/SystemView.jsx`, `game/SystemProgressRing.jsx` | Zoomed system with planets |
| **Colonization** | `utils/gameState.js` (colonizeSystem), `operations/scan.js` | Scan → ship → colonize flow |
| **Building System** | `utils/gameState/buildings.js`, `game/BuildingList.jsx` | 4 building types, costs, construction |
| **Hex Grid Building** | `game/HexGrid.jsx`, `game/HexBuildingMenu.jsx` | Planet surface building placement |
| **Tech Tree** | `utils/gameState/tech.js`, `game/TechListItem.jsx` | 6 techs with cascading bonuses |
| **Resource Production** | `utils/production.js`, `utils/gameState/trade.js` | Credits, metals, energy production |
| **FTL Tethers** | `utils/ftl.js`, `game/FTLRoute.jsx`, `game/FTLTethers.jsx` | Route building, trade flows |
| **Ship Management** | `utils/gameState.js`, `game/DockedShipCard.jsx`, `game/TransitShipCard.jsx` | Colony ships, transit |
| **Game State** | `utils/gameState.js`, `utils/gameState/*.js` | Signals, persistence, game loop |
| **View Navigation** | `App.jsx` | galaxy → system → planet views |
| **LOD/Performance** | `game/GalaxyMap.jsx` | Zoom-based detail levels |

---

## Utility Functions

### utils/gameState.js
- `createGameState()` - Initialize game with signals
- `newGame()` - Start fresh game
- `loadState()` / `saveState()` - localStorage persistence
- `scanSystem(systemId)` - Initiate scan
- `colonizeSystem(systemId, shipId)` - Complete colonization
- `launchColonyShip(shipId, destinationId)` - Send ship
- `startBuilding(systemId, buildingId)` - Begin construction
- `researchTech(techId)` - Start research
- `buildFTL(tetherId)` - Upgrade route
- `findPath(galaxy, sourceId, targetId)` - BFS pathfinding
- `enterSystemView(systemId)` / `exitSystemView()` - View navigation
- `enterPlanetView(planetId)` / `exitPlanetView()` - View navigation

### utils/galaxy.js
- `generateGalaxy()` - Create systems and routes
- `getStarColor(spectralClass, id, size)` - Deterministic coloring
- Constants: `MAP_WIDTH`, `MAP_HEIGHT`, `CENTER_X`, `CENTER_Y`, `SPECTRAL_CLASSES`

### utils/format.js
- `formatTime(ms)` - "2m 30s" format
- `formatNumber(num)` - K/M suffix
- `formatRate(rate)` - "+0.5" format

### operations/scan.js
- `SCAN_COST` = 50 credits
- `SCAN_BASE_TIME` = 30s, `SCAN_TIME_PER_HOP` = 5s
- `calculateHopsToSystem()`, `calculateScanDuration()`, `getScanInfo()`

---

## State Signals (gameState.js)

| Signal | Type | Description |
|--------|------|-------------|
| `galaxyData` | `{systems[], routes[]}` | Generated galaxy |
| `selectedSystemId` | `string \| null` | Currently selected |
| `homeSystemId` | `string` | Player's starting system |
| `credits` | `number` | Global currency |
| `creditsRate` | `number` | Credits per second |
| `ships` | `Ship[]` | Colony ships |
| `builtFTLs` | `Set<string>` | Built tether IDs |
| `ftlConstruction` | `{id, progress}[]` | FTL build queue |
| `tech.researched` | `string[]` | Completed techs |
| `tech.current` | `{id, progress} \| null` | In-progress research |
| `hexBuildings` | `{[hexId]: buildingId}` | Planet buildings |
| `hexConstructionQueue` | `{hexId, buildingId, progress}[]` | Build queue |
| `viewState` | `'galaxy' \| 'system' \| 'planet'` | Current view |
| `zoomLevel` | `number` | LOD trigger |

---

## Testing Files

| Test File | Tests |
|-----------|-------|
| `utils/galaxy.test.js` | Galaxy generation invariants |
| `utils/gameState.test.js` | State management, save/load |
| `utils/gameState.visibility.test.js` | Fog of war logic |
| `utils/ftl.test.js` | FTL building validation |
| `utils/production.test.js` | Production calculations |
| `components/common/Modal.test.jsx` | Modal component |
| `components/game/CommandBar.test.js` | Command bar UI |
| `components/game/Sidebar.test.js` | Sidebar panel |
