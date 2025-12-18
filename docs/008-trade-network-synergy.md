# 008: Trade Network Synergy

## Overview

A simple adjacency bonus system where Trade Hubs gain increased Credit production when connected to other Trade Hubs via FTL routes.

## Mechanic

**Core Rule:** Each Trade Hub gets **+15% Credits production** for every FTL-connected system that also has a Trade Hub.

**Cap:** Maximum bonus of **+45%** (3 connections).

### Example

```
System A (Trade Hub) ──FTL── System B (Trade Hub) ──FTL── System C (Trade Hub)
                                      │
                                     FTL
                                      │
                               System D (Ore Mine only)
```

- System A: +15% (connected to B)
- System B: +30% (connected to A and C)
- System C: +15% (connected to B)
- System D: No Trade Hub, no bonus

## Why This Design

Based on research into adjacency systems (see `docs/research/003-adjacency-and-proximity-bonuses.md`), this design avoids common pitfalls:

| Problem | How We Solve It |
|---------|-----------------|
| **Permanence Anxiety** | Trade Hubs can be built anytime; no early-game planning required |
| **Spreadsheet Gaming** | Simple rule: +15% per connected Trade Hub, cap at 45% |
| **Arbitrary Bonuses** | Thematically intuitive: trade routes need partners on both ends |
| **Optimization Hell** | Hard cap at +45% means "good enough" is achievable |

## Implementation Notes

### Calculation

```javascript
function calculateTradeHubBonus(systemId, systems, routes) {
  const system = systems.find(s => s.id === systemId);
  if (!system.buildings.tradeHub) return 0;

  // Find connected systems via FTL routes
  const connectedIds = routes
    .filter(r => r.source === systemId || r.target === systemId)
    .map(r => r.source === systemId ? r.target : r.source);

  // Count connected systems with Trade Hubs
  const connectedTradeHubs = connectedIds.filter(id => {
    const connected = systems.find(s => s.id === id);
    return connected?.owner === 'Player' && connected?.buildings?.tradeHub;
  }).length;

  // Cap at 3 connections (45% max)
  return Math.min(connectedTradeHubs, 3) * 0.15;
}
```

### UI Feedback

1. **Route Visualization:** FTL routes between two player-owned Trade Hubs should glow or pulse to indicate active trade synergy
2. **Tooltip:** Show breakdown in system details: "Trade Network: +30% (2 connected Trade Hubs)"
3. **Build Preview:** When hovering to build a Trade Hub, show projected network bonus

### Integration with Existing Systems

- Applies **after** resource richness multiplier
- Applies **after** technology bonuses (Trade Networks tech)
- Stacks multiplicatively: `base * richness * tech * (1 + networkBonus)`

## Future Considerations

This pattern could extend to other buildings if players respond well:

- **Shipyard Supply Chain:** Shipyards build faster when connected to Ore Mines
- **Energy Grid:** Solar Plants share excess capacity with neighbors
- **Mining Consortium:** Ore Mines get bonus when multiple are connected

However, start with just Trade Hubs to keep the system learnable.
