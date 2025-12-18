# Game Concept

## Overview

A minimalist **turn-based 4X strategy game** set in space. Players explore a procedurally generated galaxy, expand their empire by colonizing star systems, exploit resources, and compete with AI opponents.

The game emphasizes clarity and strategic decision-making over complexity, with a focus on elegant presentation and smooth interactions.

## Core 4X Pillars

### 1. eXplore
- **Galaxy Discovery**: 25 star systems generated at game start
- **Fog of War**: Systems start unexplored (visual: darker, no details)
- **Scout Ships**: Send ships to reveal unexplored systems
- **Route Discovery**: FTL routes become visible when both connected systems are explored

### 2. eXpand
- **Colonization**: Click unexplored system → Send colony ship → Claim ownership
- **Territory Control**: Owned systems have distinct visual indicator (brighter glow)
- **Expansion Strategy**: Limited resources force strategic choices about which systems to colonize
- **Population Growth**: Colonized systems grow population each turn

### 3. eXploit
- **Resource Types**:
  - **Credits**: Universal currency for building ships and structures
  - **Population**: Generates credits per turn, enables ship production
  - **Strategic Resources**: Rare resources in certain systems (future enhancement)

- **Production**: Each system can build:
  - Ships (scout, colony, combat)
  - Upgrades (population boost, defense)

### 4. eXterminate
- **Fleet Combat**: Ships can engage enemy fleets
- **Turn-Based Resolution**: Combat resolves instantly at turn end
- **Simple Combat Model**: Attacker vs Defender strength comparison
- **System Capture**: Defeat all defending ships to capture system

## Game Flow

### Initial State
1. Player starts with 1 home system (center of map)
2. 24 other systems are unexplored
3. Starting resources: 100 credits, 1 scout ship
4. Turn counter: 1

### Turn Sequence

**Player Phase:**
1. **Move ships** - Click ship → Click destination → Route is calculated
2. **Build units** - Click system → Select build option → Spend credits
3. **Research** (future) - Unlock new technologies
4. **Diplomacy** (future) - Interact with AI empires

**Resolution Phase** (when player clicks "Next Turn")
1. Ships move along their routes (progress += speed)
2. Ships arriving at systems trigger events:
   - Scout ships reveal unexplored systems
   - Colony ships colonize unowned systems
   - Combat ships engage enemies
3. Combat resolves (if any)
4. Resources are collected:
   - Population generates credits
   - Systems produce queued units (if production complete)
5. AI empires take their turns
6. Turn counter increments

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
- Multi-hop routes calculated automatically (A* algorithm)
- Movement speed: 1 system per 3 turns (configurable)

**Visual Feedback:**
- Selected ship shows destination line
- Moving ship animates along the route
- Progress indicator (ship position on line)

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

**Credit Generation:**
```
Credits per turn = Sum of (System Population × 10)
```

**Ship Costs:**
- Scout Ship: 50 credits (speed: fast, combat: 0)
- Colony Ship: 100 credits (speed: slow, combat: 0)
- Fighter: 80 credits (speed: medium, combat: 1)
- Cruiser: 200 credits (speed: slow, combat: 3)

**System Upgrades:**
- Population Growth: 150 credits (increases population by 5)
- Defense Station: 300 credits (adds +2 defense to system)

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

**Stats Panel (Right):**
```
═════════════
 TURN 23
─────────────
Credits
1,240

Systems
12 / 25

Fleet Size
8 ships
═════════════
```

**Command Bar (Bottom):**
```
[NEXT TURN (Space)]  [RESEARCH]  [DIPLOMACY]
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
2. Achieve 500 credits per turn
3. Defeat one AI empire

### Long-Term Goals
1. Complete victory condition
2. Win on Hard difficulty
3. Win in under 50 turns (speedrun)

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
- **Multiplayer**: Hot-seat or online turn-based
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
- **No real-time**: Turn-based only
- **Simple combat**: No tactical positioning
- **Limited unit types**: 4 ship types maximum
- **No story**: Pure sandbox gameplay
- **Single-player only**: AI opponents only

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
- **Civilization**: Turn-based 4X structure
- **FTL**: Route-based ship movement
- **Into the Breach**: Minimalist strategy presentation

### Technical References
- **D3.js force simulations**: For organic galaxy layout
- **SolidJS reactivity**: For efficient state updates
- **CSS animations**: For smooth, performant UI
