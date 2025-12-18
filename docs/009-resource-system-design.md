# Resource System Design

A scientifically-grounded resource system for Sol3000, based on real astrophysics, stellar nucleosynthesis, and the dynamics research in `research/002-system-planet-count.md`.

---

## Design Principles

1. **Astrophysically Plausible**: Resources reflect actual cosmic element distribution and formation processes
2. **Strategically Interesting**: Rarity tiers create meaningful trade-offs and territorial value
3. **Thematically Coherent**: Resource names evoke space industry without being overly technical
4. **Gameplay-First**: Complex science simplified into actionable game mechanics

---

## The Science: Where Elements Come From

| Process | Elements Produced | Implication |
|---------|-------------------|-------------|
| Big Bang | H, He, trace Li | Ubiquitous - every system has these |
| Stellar Fusion | C, N, O, Si, up to Fe | Common in rocky bodies |
| Supernovae | All elements > Fe | Heavier elements are rarer |
| Neutron Star Mergers | Au, Pt, U, heavy r-process | Platinum group, actinides very localized |
| AGB Stars (s-process) | Some heavy elements | Contributes to rare earths |

**Key Insight**: Iron is the most stable nucleus - stellar fusion stops there. Everything heavier requires violent events (supernovae, neutron star collisions), making heavy elements genuinely rare.

---

## Resource Tiers

### Tier 1: FOUNDATIONAL (80% of systems)

| Resource | Composition | Source Bodies | Primary Use |
|----------|-------------|---------------|-------------|
| **Ore** | Iron, Nickel, Aluminum | Rocky planets, asteroids, planetary cores | Basic construction, ship hulls, stations |
| **Volatiles** | H₂O, NH₃, CH₄, CO₂ | Comets, ice moons, outer system bodies | Life support, fuel, population growth |
| **Silicates** | Silicon, common oxides | Rocky bodies, regolith | Basic electronics, construction materials |

**Design Note**: Every system should have at least one of these. They're the "bread and butter" that lets players build basic infrastructure anywhere.

---

### Tier 2: INDUSTRIAL (40% of systems)

| Resource | Composition | Source Bodies | Primary Use |
|----------|-------------|---------------|-------------|
| **Refractory Metals** | Titanium, Tungsten, Chromium, Molybdenum | Planetary mantles, metallic asteroids | Advanced alloys, weapons, high-performance engines |
| **Noble Gases** | Xenon, Krypton, Neon, Argon | Planetary atmospheres, trapped in regolith | Ion propulsion, industrial processes, lighting |
| **Fissiles** | Uranium-235, Thorium-232 | Supernova remnant regions, old planetary crusts | Fission reactors, radioisotope generators |

#### Noble Gas Details

| Gas | Atomic Mass | Key Properties | Space Industry Use |
|-----|-------------|----------------|-------------------|
| **Xenon** | 131 | Heavy, inert, high ionization efficiency | Premium ion drive propellant, anesthesia |
| **Krypton** | 84 | Moderate mass, bright emission lines | Lasers, lower-cost ion propulsion |
| **Neon** | 20 | Light, distinctive red-orange glow | Cryogenics, some laser applications |
| **Argon** | 40 | Abundant, cheap, inert | Welding shields, plasma drives, industrial |

**Why Xenon Matters**: Ion drives work by accelerating ionized gas. Heavier atoms = more momentum per ion = more thrust. Xenon's high atomic mass makes it the gold standard for efficient space propulsion.

---

### Tier 3: STRATEGIC (15% of systems)

| Resource | Composition | Source Bodies | Primary Use |
|----------|-------------|---------------|-------------|
| **Rare Earths** | Neodymium, Dysprosium, Europium, Yttrium | Specific geological formations, differentiated asteroids | Magnets, lasers, superconductors, advanced sensors |
| **Platinum Group** | Platinum, Palladium, Iridium, Osmium, Rhodium | Asteroid impacts, undifferentiated primitive bodies | Catalysts, fuel cells, medical tech, corrosion resistance |
| **Helium-3** | ³He isotope | Gas giant atmospheres, solar-wind-exposed regolith | Aneutronic fusion, cryogenics, leak detection |

#### Why Helium-3 is the Holy Grail

Standard fusion (Deuterium-Tritium):
```
D + T → He-4 + n (neutron)
       ↓
       Neutrons irradiate reactor walls
       Creates radioactive waste
       Requires heavy shielding
```

Helium-3 fusion (Deuterium-He3):
```
D + ³He → He-4 + p (proton)
          ↓
          Charged particles only
          Magnetically containable
          Direct electricity conversion
          No radioactive waste
```

**The Catch**: Earth has ~15 kg of He-3 total. Gas giants have effectively unlimited supplies in their atmospheres. This makes gas giant systems strategically critical.

---

### Tier 4: EXOTIC (<5% of systems)

| Resource | Composition | Source Bodies | Primary Use |
|----------|-------------|---------------|-------------|
| **Transactinides** | Superheavy elements (Island of Stability) | Neutron star merger debris, ancient supernova sites | Theoretical applications, megastructure components |
| **Antimatter Traces** | Positrons, antiprotons | Black hole accretion disks, cosmic ray interactions | Ultimate energy storage, end-game technology |
| **Crystalline Matrices** | Exotic mineral structures from extreme conditions | Near black holes, magnetar fields | Speculative tech, "wonder" construction |

**Design Note**: These should be extremely rare (1-3 systems in the entire galaxy) and enable end-game victory conditions or unique buildings.

---

## Distribution by System Archetype

Based on the Kepler Dichotomy research (dynamically cold vs hot systems):

### Multi-Planet Systems (Dynamically Cold)

*Systems like Sol that retained multiple planets through gentle migration*

- **Resource Profile**: Diverse and balanced
- **Inner Rocky Worlds**: Ore, Silicates, Rare Earths
- **Asteroid Belt**: Platinum Group, Refractory Metals
- **Gas Giants**: Helium-3, Noble Gases, Volatiles
- **Outer Icy Bodies**: Volatiles, Fissiles

**Gameplay**: Jack-of-all-trades systems. Good for establishing self-sufficient colonies.

### Few-Planet Systems (Dynamically Hot)

*Systems where gravitational chaos ejected most planets*

- **Resource Profile**: Concentrated but limited variety
- **Debris Fields**: Rich in heavy metals from destroyed planets
- **Surviving Giant**: If present, excellent Noble Gases/He-3
- **Eccentric Survivors**: Extreme environments, specialized resources

**Gameplay**: High-yield single resources. Good for specialization and trade.

### Hot Jupiter Systems

*Gas giant migrated inward, disrupting inner system formation*

- **Resource Profile**: Gas-dominant
- **Hot Jupiter**: Abundant Volatiles, Noble Gases
- **Stripped Inner System**: Almost no accessible metals or rare earths
- **Potential Trojan Asteroids**: Minor Ore deposits

**Gameplay**: Excellent fuel/gas production, but requires imports for construction materials.

### Black Hole Proximity Systems

*Systems in the inner galactic ring near the central black hole*

- **Resource Profile**: Exotic-dominant, hostile
- **Accretion Disk Remnants**: Antimatter Traces, heavy elements
- **Extreme Radiation Environment**: Transactinides
- **Tidal Stress Zones**: Crystalline Matrices

**Gameplay**: High risk, high reward. End-game strategic targets.

---

## Simplified 6-Resource Implementation

For initial MVP, consolidate into 6 distinct resources:

| # | Resource | Abstracts | Rarity | Icon Concept | Primary Use |
|---|----------|-----------|--------|--------------|-------------|
| 1 | **Metals** | Fe, Ni, Al, Ti, W | Common (80%) | ⬡ Hexagon | Ships, structures, basic buildings |
| 2 | **Volatiles** | H₂O, CH₄, NH₃, CO₂ | Common (70%) | 💧 Droplet | Population growth, fuel, life support |
| 3 | **Noble Gases** | Xe, Kr, Ar, Ne | Uncommon (35%) | ◉ Rings | Propulsion tech, industrial processes |
| 4 | **Rare Earths** | Lanthanides, Y | Uncommon (25%) | ✦ Crystal | Electronics, sensors, advanced computing |
| 5 | **Isotopes** | He-3, U-235, D, Th | Rare (15%) | ☢ Atom | Power generation, fusion reactors |
| 6 | **Exotics** | Antimatter, etc. | Very Rare (3%) | ✧ Star | End-game wonders, unique buildings |

### Resource Yield Formula

```javascript
// Base yield modified by system characteristics
function calculateResourceYield(system, resourceType) {
  let baseYield = RESOURCE_BASE_YIELDS[resourceType];

  // Dynamically hot systems: +50% concentrated resources, -variety
  if (system.planetCount <= 2 && system.eccentricity > 0.3) {
    baseYield *= 1.5;
  }

  // Gas giant presence: +100% Noble Gases and Isotopes
  if (system.hasGasGiant && ['nobleGases', 'isotopes'].includes(resourceType)) {
    baseYield *= 2.0;
  }

  // Black hole proximity: exotic resources only here
  if (resourceType === 'exotics' && system.distanceFromCenter > 350) {
    return 0; // No exotics far from black hole
  }

  return Math.floor(baseYield * system.size);
}
```

---

## Cosmic Rarity Reference

Things that are **actually rare** in the universe:

| Element/Compound | Why It's Rare | Game Implication |
|------------------|---------------|------------------|
| **Phosphorus** | Specific supernova conditions required | Tie to habitability/population cap |
| **Platinum Group** | Only from neutron star mergers | Concentrated in ancient debris fields |
| **Helium-3** | Solar wind implantation or gas giant origin | Gas giants become strategic |
| **Heavy Actinides** | R-process nucleosynthesis only | Near supernova remnant systems |
| **Lithium** | Destroyed in stars, Big Bang remnant | Could add as battery/energy storage resource |

Things that are **common but valuable**:

| Element | Cosmic Abundance | Value Driver |
|---------|------------------|--------------|
| **Iron** | 4th most common metal | Ubiquitous, basis of industry |
| **Carbon** | 4th most abundant element | Nanotech, organics, life |
| **Water** | Common outer system, rare inner | Location-dependent scarcity |
| **Silicon** | 8th most abundant | Pure refined silicon is valuable |

---

## Future Considerations

### Resource Processing Chains
```
Raw Ore → Refined Metals → Alloys → Ship Components
Volatiles → Processed Fuel → Reactor Fuel
Noble Gases → Compressed Gas → Propellant Tanks
```

### Trade Value Modifiers
- Distance from production center
- System security level
- Current demand/supply
- Route safety (pirates, war)

### Depletion Mechanics
- Finite deposits that deplete over time?
- Renewable vs non-renewable distinction?
- Asteroid mining as "burst" resource acquisition?

---

## References

- `docs/research/001-stellar-and-planetary-systems.md` - Star type classifications
- `docs/research/002-system-planet-count.md` - Kepler Dichotomy, dynamical stability
- `docs/research/003-adjacency-and-proximity-bonuses.md` - Spatial bonus systems
