# Game Concept

## Overview

A minimalist **real-time idle/incremental 4X strategy game** set in space. Players explore a procedurally generated galaxy, expand their empire by colonizing star systems, exploit resources through automatic production, and build up their civilization.

The game emphasizes clarity and strategic decision-making over complexity, with a focus on elegant presentation, smooth interactions, and satisfying progression loops inspired by idle/incremental games like Cookie Clicker.

## Core 4X Pillars

### 1. eXplore
- **Galaxy Discovery**: 25 star systems generated at game start
- **Fog of War**: Systems start unexplored (visual: darker, no details)
- **Scout Ships**: Send ships to reveal unexplored systems
- **Route Discovery**: FTL routes become visible when both connected systems are explored

### 2. eXpand
- **Colonization**: Build colony ships → Launch to unclaimed systems → Claim ownership on arrival
- **Territory Control**: Owned systems have distinct visual indicator (brighter glow)
- **Expansion Strategy**: Resource costs and build times force strategic choices about which systems to colonize
- **Automatic Growth**: Colonized systems produce resources continuously in real-time

### 3. eXploit
- **Resource Types**:
  - **Credits**: Universal currency for building ships and structures
  - **Population**: Generates credits per turn, enables ship production
  - **Strategic Resources**: Rare resources in certain systems (future enhancement)

- **Production**: Each system can build:
  - Ships (scout, colony, combat)
  - Upgrades (population boost, defense)

### 4. eXterminate
- **Fleet Combat**: Ships can engage enemy fleets (future enhancement)
- **Real-Time Resolution**: Combat resolves when fleets meet
- **Simple Combat Model**: Attacker vs Defender strength comparison
- **System Capture**: Defeat all defending ships to capture system

## Game Flow

### Initial State
1. Player starts with 1 home system
2. Other systems are unclaimed
3. Starting resources: 100 Ore, 50 Energy, 200 Credits
4. Real-time game tick runs at 10 ticks/second

### Real-Time Game Loop

**Continuous Updates (every 100ms):**
1. **Resource Production** - All owned systems generate Ore, Energy, Credits based on building levels
2. **Construction Progress** - Building and ship construction timers tick down
3. **Ship Movement** - Ships in transit move along FTL routes toward destinations
4. **Research Progress** - Active tech research progresses toward completion

**Player Actions (anytime):**
1. **Build structures** - Click system → Select building → Queue construction
2. **Build ships** - Requires Shipyard → Queue colony ships
3. **Launch ships** - Select docked ship → Choose destination → Ship travels automatically
4. **Research tech** - Open tech panel → Select available tech → Research begins

### Victory Conditions

**Primary Goal**: Control majority of systems (13+ out of 25)

**Alternative Victories** (future):
- Technological superiority (research all tech)
- Economic dominance (accumulate 10,000 credits)
- Elimination (destroy all enemy empires)

## Gameplay Mechanics

### Ship Movement

**Pathfinding:**
- Ships travel along FTL routes only (no free movement)
- Multi-hop routes calculated automatically (BFS algorithm)
- Travel time: 60 seconds per FTL hop (reduced by Warp Drives tech)

**Visual Feedback:**
- Ships animate smoothly along routes in real-time
- Trail effect shows ship direction
- Destination line shows final target system

### System Management

**Owned Systems Display:**
- System name
- Current population
- Credits per turn
- Current production (if any)
- Build queue

**Actions Available:**
- Build Ship (costs credits)
- Upgrade Population (costs credits, increases production)
- Cancel Production (refunds 50% of credits)

### Combat System (Simplified)

**Combat Strength Calculation:**
```
Attacker Strength = Sum of all attacking ships
Defender Strength = Sum of defending ships + System defense bonus
```

**Resolution:**
- If Attacker > Defender: Attacker wins, loses ships proportional to defender strength
- If Defender >= Attacker: Defender wins, attacker loses all ships

**Post-Combat:**
- Winner controls the system
- Losing player's ships are destroyed
- System may be damaged (reduced population)

### Resource Economy

**Three Resource Types:**
- **Ore** - Primary building material, produced by Ore Mines
- **Energy** - Powers construction, produced by Solar Plants
- **Credits** - Universal currency, produced by Trade Hubs

**Production Rates:**
```
rate = buildingLevel × baseRate × resourceMultiplier × techBonus
```

**Building Costs (scale at 1.15× per level):**
- Ore Mine: 50 Ore, 10 Energy (builds in 30s)
- Solar Plant: 30 Ore (builds in 20s)
- Trade Hub: 80 Ore, 20 Energy (builds in 45s)
- Shipyard: 200 Ore, 50 Energy, 100 Credits (builds in 120s)

**Ship Costs:**
- Colony Ship: 500 Ore, 200 Energy, 300 Credits (builds in 180s, reduced by Shipyard level)

## AI Behavior (Phase 2)

### Basic AI Strategy:
1. **Explore**: Send scouts to nearby unexplored systems
2. **Expand**: Colonize high-value systems (high population potential)
3. **Build**: Maintain fleet size proportional to empire size
4. **Attack**: Engage if fleet strength > 1.5× player's nearby strength

### Difficulty Levels:
- **Easy**: AI delays turns, makes suboptimal choices
- **Normal**: AI plays optimally
- **Hard**: AI gets +20% production bonus

## User Interface Elements

### Main View
- Galaxy map (center, zoomable/pannable)
- Selected system info (left panel)
- Empire stats (right panel)
- Action bar (bottom)

### Information Display

**System Panel (Left):**
```
═════════════════════
  ALPHA CENTAURI
─────────────────────
Population      2.4M
Credits/Turn    +24
Owner           Player
Production      Scout Ship (2 turns)

[BUILD]  [UPGRADE]
═════════════════════
```

**Stats Panel (Top-Left):**
```
═════════════════════════
 ORE      1,240  +2.5/s
 ENERGY     580  +1.2/s
 CREDITS  2,100  +0.8/s
─────────────────────────
 DOMINION  12 / 120
 [RESEARCH: Warp Drives 45%]
═════════════════════════
```

**Command Bar (Bottom):**
```
[TECH]  [FLEET]
```

### Feedback Systems

**Visual Feedback:**
- Click ripple effect on selections
- Ship movement trails
- System ownership color coding (future: colors per empire)
- Pulsing animation on systems with pending actions

**Audio Feedback (future):**
- Click sounds
- Ship launch sound
- Combat sounds
- Turn completion chime

## Progression & Replayability

### Short-Term Goals (Tutorial Phase)
1. Explore 5 systems
2. Colonize 3 systems
3. Build a fleet of 5 ships
4. Win first combat

### Mid-Term Goals
1. Control half the galaxy (13 systems)
2. Achieve 5 credits/second production rate
3. Defeat one AI empire

### Long-Term Goals
1. Complete victory condition
2. Win on Hard difficulty
3. Achieve victory in under 30 minutes (speedrun)

### Replayability Factors
- **Random galaxy generation**: Different layout each game
- **AI variability**: Different starting positions and strategies
- **Multiple strategies**: Peaceful expansion vs military conquest
- **Difficulty settings**: Adjust challenge level

## Future Enhancements

### Phase 2 Features
- **Technology tree**: Unlock ship upgrades, economic bonuses
- **Diplomacy**: Treaties, trade routes, alliances
- **Multiple AI empires**: 2-3 competing AIs
- **More ship types**: Carriers, bombers, support ships
- **Random events**: Space anomalies, pirates, trade opportunities

### Phase 3 Features
- **Multiplayer**: Online real-time competitive
- **Custom maps**: Map editor for creating scenarios
- **Achievements**: Track player accomplishments
- **Statistics**: Detailed end-game reports
- **Save/Load**: Persist game state

### Polish Features
- **Animations**: Ship combat animations, system capture sequences
- **Particles**: Exhaust trails, explosion effects
- **Sound**: Full sound design and ambient music
- **Tutorial**: Interactive guide for new players
- **Tooltips**: Hover explanations for all UI elements

## Design Constraints

### Scope Limitations (Phase 1)
- **Session-based**: Progress only while tab is open (no offline catch-up)
- **Simple combat**: No tactical positioning (future enhancement)
- **Limited unit types**: Colony ships only for MVP
- **No story**: Pure sandbox/idle gameplay
- **Single-player only**: No multiplayer

### Technical Constraints
- **Browser-based**: Must run in modern browsers
- **No backend**: All game logic client-side
- **Small bundle**: Keep under 500KB total
- **60fps target**: Smooth animations throughout

### Accessibility Constraints
- **Keyboard controls**: All actions accessible via keyboard
- **High contrast**: Black and white ensures readability
- **No color coding**: Never rely on color alone for information
- **Screen reader support**: ARIA labels on all interactive elements

## Inspiration & References

### Visual Style
- **Mark Rothko paintings**: Nested rectangular composition
- **Modern minimalism**: Clean lines, generous whitespace
- **Glassmorphism**: Frosted glass UI trend

### Gameplay References
- **Stellaris**: Galaxy exploration and expansion
- **Cookie Clicker**: Idle/incremental progression loops
- **OGame**: Browser-based real-time strategy with build queues
- **FTL**: Route-based ship movement
- **Into the Breach**: Minimalist strategy presentation

### Technical References
- **D3.js force simulations**: For organic galaxy layout
- **SolidJS reactivity**: For efficient state updates
- **CSS animations**: For smooth, performant UI
