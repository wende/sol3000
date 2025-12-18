# Build Queue System

## Overview

Each player-owned system has a construction queue that allows queuing multiple buildings and ships. Only the first item in the queue is actively being built; others wait their turn.

## Data Structure

Each system has a `constructionQueue` array:

```javascript
system.constructionQueue = [
  {
    type: 'building' | 'ship',
    target: 'oreMine' | 'solarPlant' | 'tradeHub' | 'shipyard' | 'colonyShip',
    startTime: number,  // Date.now() when queued
    duration: number    // Build time in milliseconds
  },
  // ... more items
]
```

## Queue Processing

The game tick (`gameTick()` in `gameState.js`) processes construction queues every 100ms:

1. Only checks the **first item** (`queue[0]`) for completion
2. Calculates elapsed time: `now - item.startTime`
3. If `elapsed >= duration`:
   - Removes item from queue
   - Applies the result (building level +1, or ship added to fleet)
4. Next item becomes the new first item and starts building

**Key insight:** The `startTime` is set when the item is *queued*, not when it becomes active. Progress calculation uses `(now - startTime) / duration`, which means:
- First item: Progress increases over time
- Queued items: Progress stays at 0% until they become first

## UI Display States

In `BuildingList.jsx`, three states determine how each building is displayed:

### 1. Actively Building (first in queue)
```javascript
const isActivelyBuilding = (buildingId) => {
  const queue = constructionQueue();
  return queue.length > 0 && queue[0].type === 'building' && queue[0].target === buildingId;
};
```
- Shows: Progress bar with countdown
- CSS class: `building-in-progress` (blue border/background)

### 2. Queued (in queue but not first)
```javascript
const isQueued = (buildingId) => {
  const queue = constructionQueue();
  return queue.slice(1).some(item => item.type === 'building' && item.target === buildingId);
};
```
- Shows: "Queued" label
- CSS class: `building-queued` (gray border/background)

### 3. Not in Queue
```javascript
const isInQueue = (buildingId) => {
  return constructionQueue().some(item => item.type === 'building' && item.target === buildingId);
};
```
- Shows: Build/Upgrade button
- Used to disable button when building is already queued

## Visual Consistency

Both `Sidebar.jsx` (overview) and `BuildingList.jsx` (detailed view) now show the same states:

| Queue Position | Sidebar View | BuildingList View |
|---------------|--------------|-------------------|
| First (index 0) | Progress bar | Progress bar |
| Second+ | "Queued" text | "Queued" label |
| Not in queue | - | Build button |

## CSS Styling

```css
/* Active building - blue accent */
.building-in-progress {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.05);
}
.building-in-progress::before {
  background: #3b82f6;
}

/* Queued building - gray accent */
.building-queued {
  border-color: rgba(107, 114, 128, 0.3);
  background: rgba(107, 114, 128, 0.05);
}
.building-queued::before {
  background: #6b7280;
}

/* Queued label */
.queued-label {
  font-size: 0.65rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

## Ship Construction

Ships follow the same pattern:
- `isActivelyBuildingShip()` - colony ship is first in queue
- `isShipQueued()` - colony ship is queued but not first
- `isShipInQueue()` - colony ship is anywhere in queue

Ships share the same queue as buildings, processed in FIFO order.

## Testing

Tests in `src/utils/gameState.test.js` verify:
- Multiple buildings queue in order
- First building completes before second starts
- Queue maintains correct order (first item is active, rest are waiting)
