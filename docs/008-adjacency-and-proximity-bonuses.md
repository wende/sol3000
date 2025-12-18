# Adjacency and Proximity Bonuses: Game Design Research

Adjacency and proximity bonuses are game mechanics where the efficiency, score, or utility of a game piece (unit, building, tile) changes based on what is placed next to or near it.

While often used interchangeably, there is a subtle design distinction:
* **Adjacency:** Requires direct contact (e.g., a mine *touching* a factory). Common in grid-based games like *Civilization VI*.
* **Proximity:** Requires being within a certain range or radius (e.g., a power plant powering all factories within 6 tiles). Common in city-builders like *Anno 1800*.

## How They Work: Core Systems

These systems generally fall into three categories:

1. **Yield Multiplication:** A building produces more resources if placed correctly. (e.g., *Civilization VI*: A Campus district generates more Science if placed next to Mountains).
2. **Transformation/Synergy:** Placing specific items together creates a new, more powerful item. (e.g., *Loop Hero*: Placing a 3x3 grid of Rocks transforms them into a "Mountain Peak" which grants huge HP bonuses but spawns harpies).
3. **Scoring Puzzles:** The placement *is* the game. You don't produce resources; you produce points. (e.g., *Dorfromantik*: Matching a forest edge to another forest edge grants points).

## What People Like & Dislike (Reddit & Community Sentiment)

### The Good: "The Satisfying Puzzle"
* **Depth & Mastery:** Players love the feeling of "cracking the code." Finding a layout that squeezes 10% more efficiency out of a factory feels like a genuine intellectual achievement.
* **City Planning Identity:** It prevents cities from being "cookie-cutter" builds. In *Civilization VI*, a city in the desert looks and functions differently than one in the rainforest because you are chasing different adjacency bonuses.
* **"Number Go Up":** There is a primal satisfaction in seeing a +6 bonus instead of a +1. It provides immediate, quantifiable feedback on your skill.

### The Bad: "Min-Max Anxiety" & "Spreadsheet Gaming"
* **Permanence Anxiety:** This is the #1 complaint on Reddit regarding *Civilization VI*. Players hate having to plan a district layout for turn 200 when they are on turn 10. "If I place this here now, I ruin a +4 bonus later." This leads to "analysis paralysis."
* **Immersion Breaking:** Sometimes the bonuses feel arbitrary ("gamey") rather than logical. Why does a Commercial Hub get a bonus from a river? (Makes sense). Why does it get a bonus from a Government Plaza specifically? (Abstract "design wank").
* **Required Homework:** Players dislike needing external tools (wiki, spreadsheet, or mods like "Detailed Map Tacks") just to understand where to place a building without ruining their future economy.

## Examples of Adjacency in Games

| Game | Mechanic Type | How it Works |
| --- | --- | --- |
| **Civilization VI** | **Hard Adjacency** | Districts get yields (+Science, +Gold) based on neighboring terrain and other districts. Highly complex, permanent placement. |
| **Anno 1800** | **Proximity (Radius)** | "Trade Unions" and "Town Halls" have a circular radius. Any building inside gets buffed by slotted items. Encourages Tetris-like packing of buildings. |
| **Dorfromantik** | **Puzzle Score** | Pure adjacency. Match detailed tile edges (train tracks to train tracks, trees to trees) to keep the game going. Relaxing, low stakes. |
| **Loop Hero** | **Hidden Synergy** | Placing cards changes the world. A "Meadow" heals 2 HP, but a Meadow next to a rock becomes a "Blooming Meadow" (heals 3 HP). Encourages experimentation. |
| **Against the Storm** | **Logistical Proximity** | No "magic" bonuses, but buildings must be close to warehouses to cut walking time. "Adjacency" here is about reducing travel friction, not stat multipliers. |
| **Frostpunk 2** | **Heat Adjacency** | Districts must touch each other (specifically by 3 tiles) to share heat and reduce fuel consumption. A survival necessity rather than just an optimization bonus. |

## Solutions & Design Fixes

If you are designing a game or looking for one that "solves" the frustrations of adjacency, look for these features:

### 1. Solve "Permanence Anxiety" with Moveable Buildings
* **Problem:** Players are scared to build because they can't move it later.
* **Solution:** *Against the Storm* allows you to move production camps (Woodcutters, Scavengers) for free. This encourages players to build *now* for immediate benefit without fear of ruining the "perfect" layout later.
* **Partial Solution:** *Terra Nil* is about restoration; you build structures to fix the environment and then *recycle/remove* them to leave. The impermanence is the point.

### 2. Solve "Complexity" with UI Visualization
* **Problem:** Players can't calculate "+1 for every 2 adjacent district tiles" in their head easily.
* **Solution:** *Civilization VII* (upcoming) and *Civ VI* mods use dynamic UI that shows you exactly what the bonus will be *before* you click.
* **Solution:** *Islanders* shows a clear score preview. As you hover a building, it draws lines to everything giving it points and shows the total score in big text. Immediate feedback removes the need for mental math.

### 3. Solve "Spreadsheet Fatigue" with Logical Theming
* **Problem:** Bonuses feel like arbitrary math.
* **Solution:** Make the bonuses intuitive.
  * *Good:* A Lumber Mill gets a bonus from Forests. (Logical).
  * *Bad:* A Theater Square gets a bonus from a Water Park. (Requires memorizing a rulebook).
  * *Design Tip:* Use **"Tag" based systems**. Instead of "Building A buffs Building B," use "Industrial buildings buff nearby Residential buildings." This is easier for players to parse than memorizing specific unit interactions.

### 4. Solve "Optimization Hell" with Diminishing Returns
* **Problem:** Players spend 20 minutes trying to get a +5 bonus instead of a +4.
* **Solution:** Cap the bonus or make the first adjacency the most important. If the first neighbor gives +3, and the second only gives +1, players will settle for "good enough" rather than agonizing over "perfect."
