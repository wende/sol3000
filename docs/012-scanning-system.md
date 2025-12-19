# Scanning System

This document describes the system scanning mechanic that allows players to claim unclaimed systems.

## Overview

Scanning is the primary method for expanding your empire by claiming unclaimed star systems. Unlike instant actions, scanning takes time proportional to the distance from your home system, simulating the challenge of projecting influence across greater distances.

## Core Mechanics

### Cost
- **50 credits** per scan (constant, regardless of distance)

### Duration Formula
```
duration = 30 seconds + (5 seconds × hops)
```

Where `hops` is the number of FTL route jumps in the shortest path from your home system to the target system.

**Examples:**
- Adjacent system (1 hop): 30 + 5 = **35 seconds**
- 2 hops away: 30 + 10 = **40 seconds**
- 5 hops away: 30 + 25 = **55 seconds**

### Constraints
- Only **one scan** can be active at a time
- Only **unclaimed systems** can be scanned
- Scanning can be **cancelled** at any time (no refund)

## Pathfinding

The system uses BFS (Breadth-First Search) pathfinding to find the shortest route from the home system to the target. The path follows the galaxy's FTL route network.

**Implementation:** `findPath(galaxy, startId, endId)` in `gameState.js`

The function:
1. Builds an adjacency list from all routes
2. Uses BFS to find the shortest path
3. Returns the path (excluding start node), or `null` if unreachable

## Code Structure

### Module: `src/operations/scan.js`

Contains all scan-related constants and pure utility functions:

```javascript
// Constants
SCAN_BASE_TIME = 30000    // 30 seconds in ms
SCAN_TIME_PER_HOP = 5000  // 5 seconds per hop in ms
SCAN_COST = 50            // Credits

// Functions
calculateHopsToSystem(galaxy, homeId, targetId, findPath)
calculateScanDuration(hops)
calculateScanDurationSeconds(hops)
getScanInfo(galaxy, homeId, targetId, findPath)
```

### State: `scanningSystem` signal

Tracks the currently active scan:

```javascript
{
  systemId: number,    // Target system being scanned
  startTime: number,   // Date.now() when scan started
  duration: number     // Total duration in milliseconds
}
```

Or `null` when no scan is active.

### Game State Functions

**`scanSystem(systemId)`**
- Validates: not already scanning, has credits, system is unclaimed
- Calculates hops and duration
- Deducts credits
- Sets `scanningSystem` state
- Returns `true` on success, `false` on failure

**`cancelScan()`**
- Clears `scanningSystem` state
- No credit refund

**`updateScanProgress()`** (called every game tick)
- Checks if scan duration has elapsed
- On completion: calls `colonizeSystem()` and clears scan state

## UI Components

### Sidebar (`src/components/game/Sidebar.jsx`)

For unclaimed systems, displays:

1. **When scanning this system:**
   - "SCANNING" label with remaining time
   - Progress bar (glass variant)
   - "CANCEL SCAN" button (red)

2. **When not scanning this system:**
   - "SCAN SYSTEM (50 CR, Xs)" button
   - Shows estimated duration based on hop count
   - Disabled if: insufficient credits OR another scan is in progress
   - Shows "SCAN IN PROGRESS..." text when scanning a different system

### Progress Calculation (UI)

```javascript
const elapsed = now - scan.startTime;
const progress = Math.min(100, (elapsed / scan.duration) * 100);
const remaining = Math.max(0, Math.ceil((scan.duration - elapsed) / 1000));
```

## Persistence

The `scanningSystem` state is saved to localStorage:
- Included in the save state object
- Restored on game load
- Scan continues from where it left off (based on `startTime`)

## Design Rationale

### Why Time-Based?

1. **Strategic depth**: Players must plan expansion, not spam-click
2. **Distance matters**: Closer systems are easier to claim, creating natural expansion patterns
3. **Resource management**: Credits are spent upfront, creating commitment

### Why Hops Instead of Distance?

1. **Network topology matters**: Route infrastructure affects expansion speed
2. **Predictable**: Players can count hops on the map
3. **Gameplay integration**: Encourages building FTL routes strategically

### Why Single Scan?

1. **Simplicity**: Easy to understand and track
2. **Pacing**: Prevents rapid expansion
3. **Meaningful choice**: Players must prioritize which system to scan first

## Future Considerations

Potential enhancements (not currently implemented):
- Multiple simultaneous scans (tech upgrade?)
- Scan speed bonuses from buildings or tech
- Contested scanning (if enemy systems added)
- Scan interruption by enemy actions
