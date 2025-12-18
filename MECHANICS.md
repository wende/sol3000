# Sol3000 Game Mechanics

## Core Concept

A real-time idle 4X strategy game set in space. Players expand their empire by colonizing star systems, building infrastructure, researching technology, and managing resources. Progress only accumulates while the game is active.

---

## Resources

### Three Resource Types

| Resource | Type | Purpose |
|----------|------|---------|
| **Ore** | Accumulating | Primary building material |
| **Energy** | Static capacity | Powers buildings and ships |
| **Credits** | Accumulating | Research funding, advanced construction |

### Energy System
Energy is a **static capacity** resource, not accumulating:
- Solar Plants provide energy capacity (+5 per level)
- Buildings consume energy while operational
- Ships consume energy while docked
- If energy usage exceeds capacity, production efficiency drops by 50%

### Starting Resources
- 100 Ore
- 50 Energy capacity
- 200 Credits

---

## Galaxy

### Star Systems
- 25 procedurally generated systems
- Connected via FTL routes (no free movement)
- Each system has a resource richness rating:
  - **Rich**: 1.5x production multiplier
  - **Normal**: 1.0x production multiplier
  - **Poor**: 0.6x production multiplier

### Ownership
- Player starts with 1 home system
- Remaining systems are unclaimed
- Systems are claimed by landing colony ships

### Fog of War
- Systems are only visible within **2 hops** of any colonized system
- Visibility expands automatically as new systems are colonized
- Hidden systems appear as unknown until within range

### Tether Routes
- FTL routes connecting visible systems (2 hops) to hidden systems (3+ hops) appear as faded "tether" lines
- Indicates unexplored territory just beyond current visibility
- Tethers disappear once the destination system becomes visible

---

## Buildings

Four building types available per system. Each can be upgraded to increase effectiveness.

| Building | Function | Build Cost | Energy Usage |
|----------|----------|------------|--------------|
| **Ore Mine** | Produces Ore per second | Ore | 2 per level |
| **Solar Plant** | Provides Energy capacity (+5/level) | Ore | 0 |
| **Trade Hub** | Produces Credits per second | Ore | 3 per level |
| **Shipyard** | Enables ship construction, reduces build times | Ore, Credits | 5 per level |

### Construction Rules
- One construction slot per system
- Building costs scale exponentially with level (15% increase per level)
- Upgrades take real time to complete

---

## Ships

### Colony Ship
- Only ship type in MVP
- Colonizes unclaimed systems upon arrival
- Requires Shipyard to build

### Movement
- Ships travel along FTL routes only
- Multi-hop journeys calculated automatically
- Travel time per hop: 60 seconds base
- Higher Shipyard levels reduce build time

---

## Technology

### Tech Tree Structure

```
Efficient Mining ──► Advanced Reactors ──► Warp Drives
       │
       └──► Trade Networks ──► Colonial Administration
                   │
                   └──► Galactic Dominion
```

### Technology Effects

| Technology | Effect |
|------------|--------|
| **Efficient Mining** | +25% Ore production |
| **Advanced Reactors** | +25% Energy capacity |
| **Trade Networks** | +25% Credits production |
| **Warp Drives** | -25% ship travel time |
| **Colonial Administration** | New colonies start with Level 1 buildings |
| **Galactic Dominion** | +50% all production |

### Research Rules
- One technology researched at a time
- Costs Credits
- Takes real time to complete
- Technologies have prerequisites

---

## Victory Condition

**Primary Goal**: Control majority of systems (13+ out of 25)

---

## Save/Load

- Game state automatically saves to localStorage every second (debounced)
- Saves: galaxy data, home system, resources, ships, tech progress, zoom level
- Automatically loads on page refresh
- Corrupted saves (e.g., player systems without valid home) are detected and reset

---

## Planned Features (Future Phases)

### Combat System
- Fleet combat between player and AI ships
- Combat strength based on ship composition
- System capture by defeating defenders

### Ship Types
- **Scout Ship**: Fast, reveals unexplored systems
- **Fighter**: Medium speed, low combat strength
- **Cruiser**: Slow, high combat strength

### AI Opponents
- Multiple competing AI empires
- Difficulty levels (Easy, Normal, Hard)

### Additional Systems
- Diplomacy and trade routes
- Random events
