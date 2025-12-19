# Sol3000 Game Mechanics

## Core Concept

A real-time idle 4X strategy game set in space. Players expand their empire by colonizing star systems, building infrastructure, researching technology, and managing resources. Progress only accumulates while the game is active.

---

## Resources

### Resource Types

| Resource | Type | Details |
|----------|------|---------|
| **Ore** | Accumulating | Base construction material; Ore Mines add **+0.5 ore/s** per level and each newly colonized system grants a **+50 ore** stockpile boost. |
| **Energy Capacity** | Static cap | Starts at **10**. Solar Plants add **+5 capacity per level**. Ore Mines (2), Trade Hubs (3), Shipyards (5) and each docked Colony Ship (10) consume capacity while active. |
| **Credits** | Accumulating | Funds research, scanning operations, FTL upgrades, and advanced construction. Trade Hubs add **+0.2 credits/s** per level before modifiers. |

### Energy System
Energy is a **capacity**, not a spendable resource:
- Capacity is provided by Solar Plants and tech bonuses; nothing generates energy over time.
- Every operational building and docked ship permanently reserves its listed energy usage.
- Going over capacity applies a **50% efficiency penalty** to all ore and credit production until usage is back under the cap.

### Starting Resources
- 100 Ore
- 10 Energy capacity
- 200 Credits
- Colonizing any system (by ship or scan) grants an immediate **+50 ore** bonus to jump-start construction.

---

## Galaxy

### Star Systems
- **120** procedurally generated systems arranged in a donut from 400-1100px around the galactic center (no stars inside the black hole exclusion zone).
- Systems connect to their 2-3 nearest neighbors if within 400px, creating all legal travel routes.
- Stars get a richness rating used as a production multiplier: **Rich 1.5×**, **Normal 1.0×**, **Poor 0.6×**.
- Some worlds begin flagged as **Enemy**, making them visible but unavailable for colonization until combat is implemented.

### Metals Market Roles
- ~55% of systems spawn a **Metals** market role.
- Markets randomly roll as **Supply** or **Demand** with totals between **200-1200** units; Rich worlds skew toward supply, Poor worlds toward demand.
- Market stats feed the trade network and show up in the System Overview panel (e.g., `SUP 600` or `DEM 400`).

### Ownership
- Player starts with one randomly selected home system (preferably non-Poor).
- Remaining systems may be Unclaimed or Enemy-controlled by default.
- Unclaimed systems can be claimed by landing a Colony Ship **or** by completing a planet scan (see Scanning Operations).

### Fog of War
- Systems are only visible within **2 hops** of any colonized system
- Visibility expands automatically as new systems are colonized
- Hidden systems appear as unknown until within range

### Tether Routes
- FTL routes connecting visible systems (2 hops) to hidden systems (3+ hops) appear as faded "tether" lines
- Indicates unexplored territory just beyond current visibility
- Tethers disappear once the destination system becomes visible
- Selecting a tether opens the **Tether Info** panel that shows the two connected systems, their distance, estimated **6s** hop travel time, and whether an FTL upgrade already exists

## Trade & FTL Logistics

### FTL Route Upgrades
- Any discovered FTL route can be upgraded for **20 Credits**, flagging the route as a permanent hyperspace corridor.
- Upgraded routes glow in the galaxy map, show throughput tags, and remain selectable through saves.
- Building FTL corridors is a prerequisite for moving Metals between systems—the trade solver ignores routes that have not been upgraded.
- FTL upgrades are initiated from the Tether Info panel; the **Build FTL** button only activates when **both endpoints are Player-owned (scanned)**, you have the 20 credits available, and the route has not already been upgraded. Attempts that fail (unscanned endpoints, insufficient credits, duplicate builds) are rejected with no credit loss.
- Built route IDs live in the persistent `builtFTLs` set so your network state survives reloads and prevents accidental double-builds.

### Metals Trade Network
- Each Metals **Supply** node exports up to its rolled capacity while **Demand** nodes import until satisfied.
- The flow solver splits supply fairly across all connected demands (respecting the upgraded-route graph) and records how much each system exports/imports.
- Every unit of Metal delivered yields **0.01 Credits per second** of passive income, added on top of Trade Hub production.
- The System Overview panel displays how much of a supply or demand is being met, while individual routes show cumulative throughput once FTL is active.
- When an upgraded route connects a supply system to a demand system, it becomes an animated **trade tether** (solid core line plus fast-moving dash overlay) so you can instantly see which FTL corridors are carrying metals.

## Scanning Operations

- Any unclaimed system can be scanned remotely for **50 Credits**.
- Only one scan may run at a time; cancelling a scan stops progress with no refund.
- Scan time is **30s + 5s per hop** (hops determined from the home system), so deeper systems take longer.
- Completing a scan instantly colonizes the system just like landing a Colony Ship, honoring tech like Colonial Administration and granting the +50 ore colonization bonus.

---

## Buildings

Four building types are currently implemented per system. Costs below are the **base** costs at level 0 before the exponential scaler.

| Building | Base Cost | Effect per Level | Energy Usage |
|----------|-----------|------------------|--------------|
| **Ore Mine** | 50 Ore | +0.5 Ore/sec (subject to richness multiplier & energy penalty) | 2 |
| **Solar Plant** | 30 Ore | +5 energy capacity | 0 |
| **Trade Hub** | 80 Ore | +0.2 Credits/sec | 3 |
| **Shipyard** | 200 Ore / 100 Credits | Enables Colony Ship construction and provides **-10% ship build time** per level | 5 |

### Construction Rules
- One construction slot per system
- Building costs scale exponentially with level (**×1.15** per level)
- Base build times (before the 1.5× per-level factor): Ore Mine 3s, Solar Plant 2s, Trade Hub 4.5s, Shipyard 12s
- Upgrade and ship builds take real time; queues advance automatically and persist through saves

---

## Ships

### Colony Ship
- Only ship type in MVP
- Requires at least **Level 1 Shipyard**
- Costs **500 Ore / 300 Credits** and takes **18s** base to build (each Shipyard level reduces build time by 10%)
- Consumes **10 energy capacity while docked**
- Colonizes unclaimed systems upon arrival and grants the +50 ore colonization bonus (plus Colonial Administration benefits, if researched)

### Movement
- Ships travel along FTL routes only
- Multi-hop journeys are calculated automatically (breadth-first search through known routes)
- Travel time per hop: **6 seconds** base, reduced by Warp Drives (-25%)
- Launch UI limits destinations to reachable unclaimed systems (closest 10 by hop count)

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

**Primary Goal**: Control majority of the procedurally generated map (**61+ out of 120 systems**). The Dominion meter in the stats panel tracks progress.

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
