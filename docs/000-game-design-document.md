# Sol3000: Game Design Document

**Version:** 1.0  
**Date:** December 19, 2025  
**Status:** Concept Phase

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Vision](#2-core-vision)
   - 2.1 [Design Philosophy](#21-design-philosophy)
   - 2.2 [Target Audience](#22-target-audience)
   - 2.3 [Unique Selling Points](#23-unique-selling-points)
3. [Game Summary](#3-game-summary)
   - 3.1 [High-Level Concept](#31-high-level-concept)
   - 3.2 [Core Gameplay Loop](#32-core-gameplay-loop)
   - 3.3 [Victory Conditions](#33-victory-conditions)
4. [Core Mechanics](#4-core-mechanics)
   - 4.1 [Economic Warfare System](#41-economic-warfare-system)
   - 4.2 [Infrastructure and Trade Networks](#42-infrastructure-and-trade-networks)
   - 4.3 [Intelligence and Counter-Intelligence](#43-intelligence-and-counter-intelligence)
   - 4.4 [Space Council and Reputation](#44-space-council-and-reputation)
   - 4.5 [Resource Systems](#45-resource-systems)
5. [Progression Systems](#5-progression-systems)
   - 5.1 [Journey to the Center](#51-journey-to-the-center)
   - 5.2 [Galactic Ring Structure](#52-galactic-ring-structure)
   - 5.3 [HQ Migration Mechanics](#53-hq-migration-mechanics)
   - 5.4 [Abandoned Infrastructure](#54-abandoned-infrastructure)
6. [Company Structure and Acquisition](#6-company-structure-and-acquisition)
   - 6.1 [Subsidiary Model](#61-subsidiary-model)
   - 6.2 [Hostile Takeover Mechanics](#62-hostile-takeover-mechanics)
   - 6.3 [Bankruptcy and Recovery](#63-bankruptcy-and-recovery)
7. [Time and Distance Mechanics](#7-time-and-distance-mechanics)
   - 7.1 [Asynchronous Time Model](#71-asynchronous-time-model)
   - 7.2 [Light-Speed Information Lag](#72-light-speed-information-lag)
   - 7.3 [Construction and Operation Timers](#73-construction-and-operation-timers)
8. [Natural Constraints and Balance](#8-natural-constraints-and-balance)
   - 8.1 [Administrative Overhead](#81-administrative-overhead)
   - 8.2 [Coordination Costs](#82-coordination-costs)
   - 8.3 [Security and Vulnerability](#83-security-and-vulnerability)
   - 8.4 [Diminishing Returns](#84-diminishing-returns)
9. [Player Archetypes](#9-player-archetypes)
   - 9.1 [The Clean Trader](#91-the-clean-trader)
   - 9.2 [The Ghost](#92-the-ghost)
   - 9.3 [The Pariah](#93-the-pariah)
   - 9.4 [The Politician](#94-the-politician)
   - 9.5 [The Intelligence Broker](#95-the-intelligence-broker)
10. [MVP and Phased Development](#10-mvp-and-phased-development)
    - 10.1 [Phase 1: Single-Player Core Loop](#101-phase-1-single-player-core-loop)
    - 10.2 [Phase 2: Basic Multiplayer](#102-phase-2-basic-multiplayer)
    - 10.3 [Phase 3: Intelligence Warfare](#103-phase-3-intelligence-warfare)
    - 10.4 [Phase 4: Full Systems](#104-phase-4-full-systems)
11. [Technical Considerations](#11-technical-considerations)
    - 11.1 [Technology Stack](#111-technology-stack)
    - 11.2 [Visual Design](#112-visual-design)
    - 11.3 [User Interface](#113-user-interface)
12. [Monetization Strategy](#12-monetization-strategy)
    - 12.1 [Ethical Principles](#121-ethical-principles)
    - 12.2 [Revenue Streams](#122-revenue-streams)
13. [References and Inspirations](#13-references-and-inspirations)
    - 13.1 [OGame](#131-ogame)
    - 13.2 [Transport Tycoon Deluxe](#132-transport-tycoon-deluxe)
    - 13.3 [Offworld Trading Company](#133-offworld-trading-company)
    - 13.4 [Slipways](#134-slipways)
    - 13.5 [Other Influences](#135-other-influences)
14. [Design Decisions](#14-design-decisions)
    - 14.1 [Established Ideas](#141-established-ideas)
    - 14.2 [Abandoned Ideas](#142-abandoned-ideas)
    - 14.3 [Pros and Cons Analysis](#143-pros-and-cons-analysis)
15. [Appendices](#15-appendices)
    - 15.1 [Terminology Glossary](#151-terminology-glossary)
    - 15.2 [Example Scenarios](#152-example-scenarios)

---

## 1. Executive Summary

Sol3000 is a space-based economic 4X game that replaces traditional warfare with economic competition, corporate espionage, and market manipulation. Players build interstellar trade networks, compete for resources through infrastructure control and intelligence warfare, and progress by migrating toward the galactic center where competition intensifies.

**Genre:** Economic 4X Strategy, Browser-Based MMO  
**Platform:** Web (SolidJS), with potential mobile support  
**Business Model:** Free-to-play with ethical monetization (cosmetics and quality-of-life only)  
**Core Hook:** "Transport Tycoon Deluxe meets OGame in space - no ships, just ruthless business"

**Key Differentiators:**

- Zero ship-to-ship combat; conflict through economics and espionage
- Asynchronous gameplay (check in 2-3 times daily)
- Realistic light-speed information lag creates strategic depth
- Journey toward galactic center provides natural progression and player segmentation
- No artificial caps or pay-to-win mechanics

---

## 2. Core Vision

### 2.1 Design Philosophy

**Realism Over Spectacle**
Sol3000 embraces the reality of interstellar economics: actual space combat would be brief, devastating, and economically irrational. Instead, corporations compete through market dominance, infrastructure control, and covert operations - just as powerful entities do on Earth.

**Economic Authenticity**
The game draws from real economic principles: diminishing returns, coordination costs, information asymmetry, and market forces. Players encounter no artificial caps or "too big to fail" mechanics. Natural economic constraints create equilibrium.

**Meaningful Choices Over Micromanagement**
Players make strategic decisions about expansion, investment, and risk rather than clicking frantically. The game respects players' time while providing depth for those who seek it.

**No Pay-to-Win Philosophy**
Success comes from strategic thinking and planning, never from spending money. All monetization is limited to cosmetics and convenience features that provide no competitive advantage.

### 2.2 Target Audience

**Primary Audience:**

- Adults (25-45) with limited gaming time
- Strategy game enthusiasts who played OGame, EVE, or similar
- Players who enjoy economic simulation and optimization
- Those seeking competitive depth without twitch reflexes

**Secondary Audience:**

- Former OGame players seeking modern alternatives
- Transport Tycoon / railroad tycoon fans
- Board game enthusiasts (economic Euro games)
- Spreadsheet enjoyers who want their optimization to be a game

### 2.3 Unique Selling Points

1. **No Combat Focus:** Only 4X game where violence is economically irrelevant
2. **Realistic Physics:** Light-speed lag creates genuine strategic constraints
3. **Journey to Center:** Novel progression system that naturally segregates player skill levels
4. **Time-Respecting:** Designed for 15-30 minutes of active play per day
5. **Intelligence Warfare:** Multi-stage espionage creates tension over days, not seconds
6. **No Griefing:** Natural economic protections prevent toxic gameplay
7. **Ethical Monetization:** Cosmetics-only revenue model

---

## 3. Game Summary

### 3.1 High-Level Concept

Sol3000 places players in command of an interstellar trading corporation in a galaxy where economic dominance has replaced military conquest. Players establish trade routes between star systems, extract and refine resources, and build infrastructure to move goods efficiently across vast distances.

Competition occurs through market manipulation, supply chain control, corporate espionage, and hostile takeovers. Players must balance expansion with efficiency, invest in intelligence networks to detect threats, and manage their reputation within the Space Council governance system.

Success is measured not by territory conquered but by economic influence. The ultimate goal is to migrate one's headquarters ever closer to the galactic center, where the most valuable resources exist alongside the most ruthless competition.

### 3.2 Core Gameplay Loop

**The Economic Cycle:**

1. **Connect** systems with jump gates and infrastructure
2. **Watch** cargo flow through your network (visual feedback)
3. **Earn** credits from successful deliveries and contracts
4. **Invest** in expansion (scan new systems), optimization (upgrade existing), or technology (research improvements)
5. **Defend** your network from competitors' intelligence operations
6. **Attack** competitors through economic sabotage and market manipulation
7. **Advance** by migrating toward the galactic center when ready

**The Meta Loop:**

- Build empire over weeks/months
- Establish reputation and relationships
- Specialize in particular niches (extraction, logistics, intelligence)
- Form cartels and alliances
- Challenge or be challenged for economic supremacy
- Leave legacy infrastructure when migrating inward

### 3.3 Victory Conditions

Sol3000 has no single "win state" but multiple paths to dominance:

**Economic Dominance**

- Control X% of total trade volume in your region
- Achieve highest profit margins
- Maintain largest network efficiency

**Hostile Takeover**

- Acquire majority stakes in competitor holdings
- Absorb their infrastructure
- Eliminate rivals through corporate conquest (not military)

**Prestige Victory**

- Reach the Core (0-5 LY from galactic center)
- Survive there for extended period
- Achieve legendary status on leaderboards

**Cartel Control**

- Form trade cartel controlling critical resources
- Manipulate markets to benefit members
- Become essential power broker

**The "Win" is Ongoing:** Like EVE Online, Sol3000 is about building influence and legacy in a persistent world. The journey is the destination.

---

## 4. Core Mechanics

### 4.1 Economic Warfare System

**Market Manipulation**
Players can influence commodity prices through strategic buying, selling, and resource flooding. Unlike traditional sabotage, market manipulation affects the entire ecosystem:

- **Artificial Scarcity:** Buying up supply to spike prices
- **Market Flooding:** Dumping resources to crash prices and hurt competitors
- **Futures Trading:** Betting on price movements based on delayed information
- **Algorithmic Trading:** Setting automated trading rules for distant markets

**Supply Chain Attacks**
Rather than destroying assets, players target supply chains:

- **Contract Undercutting:** Offering better terms to steal contracts
- **Infrastructure Blocking:** Building gates that force competitors to pay transit fees
- **Supplier Lock-in:** Monopolizing source materials
- **Delivery Disruption:** Intelligence operations that slow but don't destroy

**Financial Warfare**
Economic pressure can force competitors into disadvantageous positions:

- **Debt Traps:** Loan resources at predatory rates, foreclose on defaults
- **Price Wars:** Operating at loss temporarily to bankrupt competitors
- **Resource Denial:** Controlling critical chokepoints
- **Hostile Takeovers:** Acquiring controlling interest in competitor subsidiaries

### 4.2 Infrastructure and Trade Networks

**Jump Gates**
Permanent infrastructure connecting star systems. Players build and own gates, charging transit fees or using them exclusively:

- Construction time: Hours to days (real-time)
- Capacity limits: Throughput restrictions force building multiple gates
- Upgrade paths: Increase capacity, reduce transit time, improve efficiency
- Ownership benefits: Collect fees from all traffic, see usage data

**Orbital Stations**
Hubs for refueling, repairs, market access, and information gathering:

- Market Exchange: Players trade resources with price discovery
- Refueling Depot: Required for long-distance travel (fuel consumption)
- Data Center: Communications relay for reducing information lag
- Docking fees: Passive income from station ownership

**Communication Networks**
Infrastructure that reduces information lag in distant systems:

- Relay Satellites: Decrease information age
- Intelligence Posts: Detect surveillance and threats
- Signal Processing: Analyze competitor activity
- Cost scales with distance and coverage area

**Resource Extractors and Refineries**
Production facilities that generate tradeable commodities:

- Extractors: Harvest raw materials from deposits
- Refineries: Convert raw materials into advanced goods
- Production chains: Complex goods require multiple processing steps
- Specialization: Different system types produce different resources

### 4.3 Intelligence and Counter-Intelligence

**Multi-Stage Operations**
Unlike instant "click to sabotage" mechanics, intelligence operations unfold over real-world days:

**Stage 1: Surveillance**

- Deploy monitoring infrastructure near target
- Gather intelligence over time (24-48 hours)
- Detection risk increases with proximity and duration
- Quality of intel improves with investment

**Stage 2: Analysis**

- Review gathered intelligence for vulnerabilities
- Identify weak points in supply chains
- Calculate success probabilities for operations
- Plan timing and resource allocation

**Stage 3: Penetration**

- Execute operation against identified vulnerability
- Success probability shown upfront (e.g., 65%)
- Operation takes time to execute (6-24 hours)
- Target may detect attempt and respond

**Stage 4: Cover-Up**

- Invest in hiding operational traces
- Cheap cover-up = higher identification risk
- Expensive cover-up = remain anonymous longer
- Trade-off between cost and exposure

**Counter-Intelligence**
Defensive intelligence network that detects and identifies attacks:

- **Detection:** Alert when surveillance or attack detected
- **Attribution:** Probability of identifying attacker (requires investigation)
- **Honeypots:** Fake vulnerabilities that expose attackers
- **Investigation:** Space Council services to confirm attacker identity

### 4.4 Space Council and Reputation

**Governance Model**
The Space Council is an NPC organization (initially) that enforces rules and tracks player behavior:

**Reputation System**

- Score: 0-100, affects all economic interactions
- Public record: Only confirmed violations are tracked
- Regional scope: Reputation may vary by galactic region
- Decay: Inactive players see reputation normalize over time

**Confirmed Violations**
The critical principle: Getting caught matters more than the act itself.

- Sabotage with insufficient cover-up: -15 reputation
- Proven contract breach: -20 reputation
- False accusations: -5 reputation (for accuser)
- Successful investigation defense: +5 reputation

**Investigation Services**
Players can petition the Council to investigate attacks:

- Cost: Credits or free for high-reputation players
- Process: Probabilistic analysis (e.g., "78% probability Player X responsible")
- Threshold: Requires >90% confidence for confirmed violation
- Result: Public record updated if confirmed

**Reputation Consequences**

High Reputation (80-100):

- Lower transaction fees
- Better contract terms
- Free investigations
- Market trust
- First consideration for opportunities

Medium Reputation (50-79):

- Standard operations
- Normal fees
- Must pay for investigations

Low Reputation (20-49):

- Higher transaction fees
- Contract denials
- Increased scrutiny
- Insurance premium increases

Pariah Status (<20):

- Massive penalties
- Most players refuse trade
- Council sanctions
- Forced to use black markets (less profitable)

**Political Layer (Advanced)**
In later phases, players can vote on policy changes:

- Penalty severity adjustments
- Investigation cost modifications
- Neutral zone designations
- Trade regulations

Council Representatives (elected) handle edge cases and propose policies but cannot override the algorithmic reputation system.

### 4.5 Resource Systems

**Three-Tier Scarcity Model**

**Tier 1: Unlimited Commodities**

- Resources: Water, Basic Ore, Common Gases
- Availability: Present in all or most systems
- Extraction: Unlimited rate per extractor
- Competition: Market-based (price adjusts to supply/demand)
- Purpose: Baseline needs, logistics challenge not scarcity challenge

**Tier 2: Limited Premium Deposits**

- Resources: Rare Metals, Advanced Materials, Specialized Compounds
- Availability: ~20% of systems have quality deposits
- Extraction: One extractor per premium deposit slot
- Competition: First-come-first-served claims
- Contestable: Through buyouts, sabotage, or abandonment
- Purpose: Creates expansion pressure and conflict over specific locations

**Tier 3: Regenerating Exotic Resources**

- Resources: Antimatter, Quantum Materials, Unique Elements
- Availability: ~5% of systems
- Extraction: Shared regenerating pool per system
- Competition: Tragedy of commons (overextraction depletes pool)
- Strategic: Sustainable vs. exploitative extraction choice
- Purpose: High-stakes resource management and cooperation/defection dilemmas

**Resource Chains**
Complex goods require multi-step processing:

- Raw → Processed → Advanced → Luxury
- Example: Ore → Metal → Components → Technology
- Chokepoint opportunities: Control one step, influence entire chain
- Specialization incentive: Focus on one tier for efficiency

**Market Dynamics**
Player-driven market with real supply and demand:

- Prices fluctuate based on aggregate player behavior
- Information lag means distant markets show stale prices
- Arbitrage opportunities for those with good intelligence
- Market manipulation possible through coordinated buying/selling

---

## 5. Progression Systems

### 5.1 Journey to the Center

**Core Progression Concept**
Players begin on the galactic rim and migrate their headquarters progressively toward the galactic center. Each ring closer to center features:

- Better resource quality
- Higher competition density
- Greater economic rewards
- Increased risk and complexity

This creates natural player segmentation by skill level without artificial matchmaking brackets.

**One-Way Journey**
Players can only move inward, never backward:

- Creates commitment to advancement
- Prevents veteran sandbagging (moving to newcomer zones)
- Migration is prestigious achievement
- Failure at higher levels means rebuilding, not retreating

**Distance as Status**
Leaderboards ranked by proximity to center:

- Not wealth-based (prevents pure grinding)
- Location shows skill and survival ability
- Clear aspirational goal for all players
- Veterans remember their journey upward

### 5.2 Galactic Ring Structure

**The Rim (50-45 LY from center)**

- Tutorial and learning space
- Basic resources only
- Minimal competition
- Forgiving mechanics and low stakes
- Stay duration: 1-2 weeks typically
- Migration cost: 1,000 credits

**The Outer Ring (45-35 LY)**

- Competitive introduction
- Mix of common and rare resources
- Rising player activity
- Real threat of sabotage and loss
- Proving ground for advancement
- Stay duration: 1-3 months
- Migration cost: 10,000 credits

**The Mid Ring (35-20 LY)**

- Serious competition
- Premium deposits appear
- Veteran vs. veteran conflicts
- Intelligence warfare becomes critical
- Most players' endgame destination
- Stay duration: 3-6 months or permanently
- Migration cost: 50,000 credits

**The Inner Ring (20-5 LY)**

- Elite territory
- Exotic resources available
- Cutthroat economics
- Top 10% of player base
- Reputation unforgiving
- Stay duration: Indefinite
- Migration cost: 250,000 credits

**The Core (0-5 LY)**

- Endgame content
- Unique legendary resources
- Total economic warfare
- Only the best survive
- 5-10 players maximum at any time
- Player-controlled cartels
- Stay duration: Until overthrown
- Migration cost: 1,000,000 credits

### 5.3 HQ Migration Mechanics

**Requirements for Migration**

- Minimum net worth threshold
- Minimum reputation score
- Minimum time active in current ring
- Liquid capital for migration cost

**Migration Process**

1. Player initiates migration to target ring
2. Pay migration cost (percentage of net worth)
3. 48-hour construction period
4. New HQ established at target location
5. Old infrastructure enters abandonment phase
6. 24-hour grace period to liquidate or transfer assets
7. After grace period, abandoned infrastructure becomes claimable

**Strategic Considerations**

- Which assets to keep vs. abandon
- Timing migration with market conditions
- Ensuring adequate capital for new ring competition
- Building intelligence network in target ring first
- Coordinating with allies for support in new ring

### 5.4 Abandoned Infrastructure

**Abandonment Mechanics**
When a player migrates inward, infrastructure too distant from new HQ (typically in previous ring) becomes abandoned:

- 24-hour grace period: Owner can liquidate or transfer
- After grace period: Infrastructure marked "Claimable"
- Any player can acquire for 10% of original construction cost
- First-come-first-served claim system

**Economic Cycle Benefits**

For Migrants:

- Focus capital on new location
- Salvaging is time-consuming and inefficient
- Better to abandon and build fresh in new ring

For Claimers:

- 90% discount on infrastructure
- Immediate boost to capability
- Learn from veteran's network design
- Accelerates progression through ring

**Natural Churn**
This creates perpetual opportunity:

- Outer rings constantly receive abandoned infrastructure
- Newcomers aren't starting from zero
- Veterans leave legacy behind
- Content generation without developer intervention
- Self-perpetuating economic cycle

---

## 6. Company Structure and Acquisition

### 6.1 Subsidiary Model

**Holdings Structure**
Players don't have a single monolithic "empire" but a portfolio of holdings:

- Holdings auto-created based on geography (system or regional scale)
- Each holding operates as separate subsidiary
- Holdings can be bought out individually
- Player account (core) can never be eliminated

**Automatic Creation**
When player builds infrastructure in a system:

- System Alpha infrastructure → "Alpha Holdings Inc." created
- System Beta infrastructure → "Beta Holdings Corp." created
- Inter-system gates → "Transit Corp Alpha-Beta" created

No micromanagement required; structure emerges naturally from geography.

**Benefits**

- Geographic isolation: Losing one holding doesn't cascade
- Realistic: Mirrors actual corporate structures
- Natural size limits: Each holding has local scope
- Can't lose everything simultaneously
- Realistic acquisition targets (buy holding, not empire)

### 6.2 Hostile Takeover Mechanics

**Acquisition Process**

Requirements:

- Target holding must be <50% of target's total portfolio value
- Attacker must have 2x the acquisition cost (prevents all-in desperate moves)
- 48-hour window for target to respond

Cost:

- 51% of holding's market value
- Market value = infrastructure value + current assets - debt

**Target's Response Options**

1. Accept Buyout
   
   - Receive market value in credits
   - Lose the holding
   - Use capital to rebuild elsewhere

2. Defensive Recapitalization
   
   - Spend 125% of attacker's bid to maintain control
   - Expensive but keeps holding
   - Debt allowed but increases vulnerability

3. Find White Knight
   
   - Ally counter-bids for holding
   - Friendly acquisition instead
   - Still lose holding but to ally

4. Asset Strip (Scorched Earth)
   
   - Dismantle infrastructure before sale completes
   - Recover partial value
   - Buyer gets less than paid for
   - Reputation penalty (Space Council disapproves)

**Natural Size Protection**
Market capitalization naturally prevents acquisitions of massive holdings:

- Small holding ($5,000): Easy to buy out
- Medium holding ($50,000): Requires significant capital
- Large holding ($500,000): Practically impossible (few have that capital)
- Entire empire ($5,000,000): Market naturally prevents (no single player has that much liquid)

No artificial "too big to buy" rule needed; economics provide protection.

### 6.3 Bankruptcy and Recovery

**Financial Collapse**
If holding debt exceeds sustainable levels:

**Bankruptcy Process:**

1. Holding enters debt status (30-day warning)
2. Owner can pay debt or sell assets
3. If unresolved: Automatic bankruptcy filing
4. Creditors force sale
5. Holding auctioned to highest bidder
6. Owner receives nothing (or difference if assets > debt)

**Alternative Acquisition Path**

- Sabotage competitor's revenue
- Force operational losses
- Wait for bankruptcy
- Acquire at auction (potentially below market value)

**Recovery Mechanisms**

Protected Core:

- Every player has un-buyable core account
- Includes starting system infrastructure
- Basic communication access
- Guaranteed rebuild capability

Exile Option:

- If player loses all holdings
- Can create new HQ in Outer Ring
- Reputation remains (marked as failed)
- Knowledge remains (advanced tactics)
- Comeback stories possible

This prevents total elimination while maintaining high stakes.

---

## 7. Time and Distance Mechanics

### 7.1 Asynchronous Time Model

**Inspired by OGame**
Sol3000 is designed for players who cannot dedicate continuous hours:

- Infrastructure builds over real-world hours or days
- Operations execute while player is offline
- Check in 2-3 times daily for decisions
- No twitch reflexes or constant monitoring required

**Time Investment Balance**

- 5 minutes: Check status, issue build orders, respond to alerts
- 15 minutes: Plan operations, analyze intelligence reports, adjust strategy
- 30+ minutes: Deep strategic planning, market analysis, treaty negotiations

Most players spend 15-30 minutes per day actively playing, with longer sessions being optional deep-dives.

**Construction Timers**

- Jump gates: 30 minutes to 24 hours (depending on tech and distance)
- Stations: 2-48 hours
- Research: 6 hours to 7 days
- Operations: 6-24 hours to execute

Timers create anticipation and "check back later" compulsion without requiring constant presence.

### 7.2 Light-Speed Information Lag

**Core Principle**
Distance creates information asymmetry, not command delay.

**What's Instant: Player Commands**

- Building orders to your own infrastructure execute immediately
- Upgrades, construction, fleet movements all instant to queue
- No frustrating "wait for signal to arrive" delays
- Explanation: Automated FTL communication to owned assets

**What's Delayed: World Intelligence**

Market Data:

- Distant system prices show timestamp
- Age = distance in light-hours
- "Ore price: 45cr (updated 50 hours ago)"
- Can trade on stale data (risky) or wait for fresh intel

Threat Detection:

- Attacks on distant holdings detected late
- Alert arrives after damage done
- "Sabotage detected 50 hours ago"
- Incentivizes concentrated empires or intel investment

Competitor Activity:

- Distant competitor movements unknown
- See results, not real-time actions
- Intelligence networks reduce lag (for a cost)

**Strategic Implications**

- Close holdings: Easy to defend, quick information
- Distant holdings: Autonomous, higher risk, delayed intelligence
- Trade-off between expansion and control
- Intelligence network investment becomes crucial for sprawling empires

### 7.3 Construction and Operation Timers

**Infrastructure Build Times**
Scale based on complexity and distance:

- Basic extractor: 30 minutes
- Jump gate: 2-6 hours
- Orbital station: 12-24 hours
- Advanced facility: 2-7 days

**Research Times**
Technology investment represents long-term planning:

- Basic research: 6-12 hours
- Advanced research: 1-3 days
- Breakthrough research: 5-7 days

**Operations Execute Over Time**
Intelligence operations aren't instant:

- Surveillance deployment: 2-4 hours
- Data gathering: 24-48 hours
- Operation execution: 6-24 hours
- Cover-up window: 12-48 hours

This creates tension and "living world" feeling where events unfold while player is away.

---

## 8. Natural Constraints and Balance

**Design Philosophy:** No artificial caps. Natural economic and physical constraints create equilibrium.

### 8.1 Administrative Overhead

**Coordination Costs Scale Non-Linearly**
As empire grows, percentage of revenue consumed by administration increases:

Formula: Overhead = (Holdings^1.3) / 100

Examples:

- 5 holdings: 7% overhead
- 10 holdings: 13% overhead
- 20 holdings: 25% overhead
- 50 holdings: 45% overhead
- 100 holdings: 63% overhead

**Components of Overhead:**

- Coordinating supply chains across systems
- Managing contracts between holdings
- Security infrastructure and monitoring
- Intelligence network maintenance
- Communication infrastructure costs

**Strategic Implication:**
Large empires have more gross revenue but lower profit margins. Small empires can be more efficient per-holding. No artificial cap needed; economics naturally limit growth.

### 8.2 Coordination Costs

**Distance = Management Difficulty**
Light-speed lag makes distant holdings harder to coordinate:

- Close holdings: Real-time control, easy coordination
- Medium distance: Delayed intelligence, planning required
- Far holdings: Autonomous operation necessary, high risk

**Communication Infrastructure**
Players can invest to reduce lag but it's expensive:

- Basic coverage: Free, high lag
- Enhanced network: 100cr/month, moderate lag
- Premium coverage: 500cr/month, minimal lag

Trade-off: Pay for better coordination or accept inefficiency.

**Diminishing Control**
The further from HQ, the less reactive control possible:

- Can always issue orders (instant)
- But can't respond quickly to threats
- Local autonomous systems needed
- Requires trust or redundancy (both costly)

### 8.3 Security and Vulnerability

**Attack Surface Grows Faster Than Defense**
Larger empires have more potential targets:

5 holdings:

- ~10 potential targets
- Defend 2-3 critical points
- Cost: Manageable

50 holdings:

- ~200 potential targets
- Can't defend everything
- Must prioritize
- Attackers find weak points

**Asymmetric Warfare**

- Defender must defend everywhere
- Attacker only needs one success
- Classic asymmetric advantage

**Security Cost Scaling**
Securing large empire becomes prohibitively expensive:

- Small empire: Security 5% of revenue
- Medium empire: Security 15% of revenue
- Large empire: Security 30% of revenue

Combined with overhead, this creates natural empire size limit.

### 8.4 Diminishing Returns

**Best Opportunities Captured First**
Initial expansion targets best systems:

Holdings 1-5:

- Best systems in range
- Premium resources
- Strategic locations
- ROI: 20%/month

Holdings 20-30:

- Mediocre systems
- Common resources
- ROI: 10%/month

Holdings 50+:

- Poor systems remaining
- Marginal resources
- ROI: 3%/month

**Capital Efficiency Decreases**
Better to deepen existing holdings than expand to marginal systems:

- Upgrade infrastructure in good systems: 15% ROI
- Expand to marginal new system: 5% ROI
- Strategic choice: When to stop expanding?

**Natural Self-Limitation**
Players optimize for profit, which naturally constrains empire size without artificial caps.

---

## 9. Player Archetypes

Sol3000's systems enable fundamentally different playstyles, all viable:

### 9.1 The Clean Trader

**Profile:**

- Maintains 90-100 reputation
- Never sabotages competitors
- Profits from pure efficiency
- Trusted by all players

**Advantages:**

- Best contract terms
- Lowest transaction fees
- Free Council investigations
- First choice for opportunities
- Alliance magnet (everyone wants clean allies)

**Disadvantages:**

- No sabotage options (self-imposed)
- Targets for aggressive players
- Must compete on efficiency alone
- Less drama/excitement

**Strategy:**

- Build most efficient networks
- Specialize in reliability
- Become essential supplier
- Leverage reputation for access

**Endgame:**

- Becomes vital infrastructure player
- Controls key supply chains
- Others depend on them
- Economic power through trust

### 9.2 The Ghost

**Profile:**

- Constantly sabotaging but never caught
- Maintains 70-85 reputation (suspiciously high for success level)
- Invests heavily in cover-ups
- Master of intelligence warfare

**Advantages:**

- Disrupts competitors while staying clean
- Keeps good reputation benefits
- Effective economic warfare
- Feared but not proven

**Disadvantages:**

- Expensive cover-ups reduce profit margins
- Always at risk of exposure
- One mistake ruins reputation
- High stress, constant planning

**Strategy:**

- Meticulous operation planning
- Maximum investment in cover-ups
- Target selection based on detection risk
- Maintain plausible deniability

**Endgame:**

- Shadow kingmaker
- Manipulates markets unseen
- Reputation as "lucky" not skilled (intentional misdirection)
- Thrives on information asymmetry

### 9.3 The Pariah

**Profile:**

- Low reputation (<40)
- Openly aggressive
- Uses black market exclusively
- Doesn't care about Council opinion

**Advantages:**

- No cover-up costs (already known)
- Maximally aggressive operations
- Intimidation factor
- Higher risk tolerance

**Disadvantages:**

- Massive transaction penalties
- Most players refuse trade
- Council sanctions
- Limited to black market (less profitable)
- Everyone expects and prepares for attacks

**Strategy:**

- All-in aggression
- Operate in Outlands (less Council oversight)
- Form pariah alliances
- Actually can be profitable despite penalties

**Endgame:**

- Outlaw legend
- Controls black market networks
- Feared reputation
- Becomes ecosystem villain (content generator)

### 9.4 The Politician

**Profile:**

- Maintains 90+ reputation
- Never directly sabotages
- Uses Space Council as weapon
- Master of soft power

**Advantages:**

- Council voting power (if implemented)
- Can file complaints against rivals
- Organizes collective action
- Reputation as weapon

**Disadvantages:**

- Indirect methods slower
- Requires coalition building
- Vulnerable to Ghosts (can't prove their sabotage)
- Time-intensive diplomacy

**Strategy:**

- Build coalitions against targets
- File legitimate complaints
- Lobby for favorable policies
- Economic soft power

**Endgame:**

- Political kingmaker
- Controls Council decisions
- Broker of alliances
- Shapes game meta through politics

### 9.5 The Intelligence Broker

**Profile:**

- Neutral (75-85 reputation)
- Specializes in information gathering
- Sells intelligence to others
- Doesn't produce or trade goods

**Advantages:**

- Profitable niche (everyone needs intel)
- Relatively safe (neutral = fewer enemies)
- High value to all players
- Unique position

**Disadvantages:**

- Target for everyone (possess valuable secrets)
- Trust issues (who are you really loyal to?)
- Delicate balancing act (can't favor one side too much)
- Limited direct power

**Strategy:**

- Extensive intelligence network
- Sell information to highest bidder
- Maintain neutrality
- Broker deals between factions

**Endgame:**

- Information monopoly
- Essential service provider
- Knows everyone's secrets
- True power behind scenes

**Archetype Interactions:**
These aren't isolated roles; they interact and create drama:

- Clean Trader needs Intelligence Broker for threat detection
- Ghost targets Politician for revenge (political rival)
- Pariah openly attacks Clean Trader (easy target)
- Politician organizes coalition against Pariah
- Intelligence Broker sells info to highest bidder, shaping conflicts

This creates emergent narratives and a living ecosystem.

---

## 10. MVP and Phased Development

**Design Principle:** Follow Gall's Law - "A complex system that works evolved from a simple system that worked."

### 10.1 Phase 1: Single-Player Core Loop

**Duration:** Month 1  
**Goal:** Prove the core economic loop is satisfying

**Features:**

- 10-20 systems with fog of war (already implemented)
- Systems have resource types (producers/consumers)
- Click to build jump gates between systems (cost: credits)
- Animated cargo flows along connections (visual feedback)
- Credits accumulate from successful deliveries
- Scan new systems to expand (fog of war reveals)
- Basic research tree (3-4 options)
- Simple objective: Reach X credits or control Y systems

**What You're Testing:**

- Is connecting systems and watching flow satisfying?
- Do scan/expand/optimize decisions feel meaningful?
- Does the "numbers go up" create dopamine response?
- Do players want to optimize their network?

**Success Criteria:**

- Playable for 30-60 minutes without boredom
- Player wants to restart with better strategy
- Core loop generates intrinsic motivation

**Key Decisions:**

- Balance: Scan cost vs. gate cost vs. research cost
- Ensure player can't afford everything (forces choice)
- Resource distribution creates interesting expansion decisions

### 10.2 Phase 2: Basic Multiplayer

**Duration:** Months 2-3  
**Goal:** Test if competition for resources is fun

**New Features:**

- 2-4 player shared map
- Compete for premium deposits (first-come-first-served)
- See competitor networks (dotted lines, not full details)
- Basic contract system: Bid for delivery contracts
- Simple market: Buy/sell resources at fluctuating prices
- Race to claim best systems

**No Sabotage Yet:**

- Competition is purely economic
- No intelligence warfare
- No hostile takeovers
- Pure infrastructure competition

**What You're Testing:**

- Is competition for space fun?
- Does racing to claim systems create tension?
- Do players naturally compete economically?
- Are contract bids interesting?

**Success Criteria:**

- Players feel competitive pressure
- Losing good system to competitor stings
- Finding better system than competitor feels good
- Players plan counter-strategies

### 10.3 Phase 3: Intelligence Warfare

**Duration:** Months 4-6  
**Goal:** Test if espionage and sabotage mechanics work

**New Features:**

- Multi-stage intelligence operations
  - Surveillance (gather info)
  - Analysis (find vulnerabilities)
  - Penetration (execute operation)
  - Cover-up (hide identity)
- Counter-intelligence networks
- Space Council basic reputation
- Investigation mechanics
- Simple sabotage: Disrupt one gate or route

**What You're Testing:**

- Is multi-day operation planning engaging?
- Does detection risk create tension?
- Is getting caught meaningful?
- Do players enjoy the spy vs. spy dynamic?

**Success Criteria:**

- Players invest in intelligence operations
- Paranoia about who's watching creates gameplay
- Cover-up decisions feel meaningful
- Reputation matters to decision-making

### 10.4 Phase 4: Full Systems

**Duration:** Months 6-12  
**Goal:** Implement complete vision

**New Features:**

- Subsidiary/holding structure
- Hostile takeover mechanics
- Bankruptcy and acquisition
- Migration system (journey to center)
- Galactic ring structure
- Abandoned infrastructure economy
- Advanced Space Council (voting, representatives)
- Full intelligence options (honeypots, market manipulation)
- Complex resource chains
- Cartel/alliance systems

**What You're Testing:**

- Does full economic warfare feel satisfying?
- Is journey to center motivating?
- Do abandoned structures create opportunity?
- Is there endgame content at Core?

**Success Criteria:**

- Players feel progression toward center
- Economic warfare creates memorable moments
- Veteran/newcomer balance works
- Multiple viable playstyles emerge
- Long-term retention (3+ months)

---

## 11. Technical Considerations

### 11.1 Technology Stack

**Frontend:**

- SolidJS (already in use)
- TypeScript for type safety
- Vite for build tooling
- WebGL or Canvas for cargo animations

**Backend (Phase 2+):**

- Node.js or similar for game server
- PostgreSQL for persistent data
- Redis for real-time updates and caching
- WebSocket for push notifications

**Deployment:**

- Vercel or similar for frontend hosting (currently in use)
- Scalable backend (AWS/GCP when needed)
- CDN for global performance

**Key Technical Challenges:**

- Real-time cargo animation performance
- Efficient state synchronization in multiplayer
- Anti-cheat for economic mechanics
- Time-based event processing (buildings completing while offline)

### 11.2 Visual Design

**Aesthetic: Minimal Data-Focused (Slipways-inspired)**

Color Palette:

- Dark background (space black or dark blue)
- Systems: Light nodes (white/gray)
- Connections: Subtle lines (gray/blue)
- Cargo: Animated dots (color by resource type)
- UI: Clean, high contrast text

Visual Language:

- Systems as circles/hexagons
- Jump gates as lines/curves
- Cargo as animated particles
- Heat maps for influence/intelligence coverage
- Minimal decorative elements
- Data-first presentation

Reference Games:

- Slipways (minimal, clean, data-focused)
- FTL: Faster Than Light (clear UI, minimal space aesthetic)
- DEFCON (abstract strategic view)
- Not like: Stellaris/Endless Space (too detailed/decorative)

### 11.3 User Interface

**Core Screens:**

Main View:

- Galaxy map with systems and connections
- Resource counter (top)
- Alert feed (side)
- Action buttons (bottom)

System Detail:

- Click system to see:
  - Resources available
  - Current production
  - Infrastructure present
  - Ownership info
  - Build options

Network Management:

- List of all holdings
- Performance metrics
- Profit/loss by holding
- Alerts and threats

Intelligence Dashboard:

- Active operations
- Surveillance coverage
- Threat level by system
- Investigation options

Research Tree:

- Available research options
- Current research progress
- Tech effects clearly shown

Market Interface:

- Resource prices with timestamps
- Buy/sell interface
- Price history charts
- Contract bidding

**UX Principles:**

- One-click actions when possible
- Clear confirmation for expensive/irreversible actions
- Tooltips explain all mechanics
- Tutorial integrated naturally
- Mobile-friendly (touch targets, responsive)

---

## 12. Monetization Strategy

### 12.1 Ethical Principles

**Core Commitment: No Pay-to-Win**

Absolutely Never Sell:

- Faster building timers
- Better resource production
- Higher efficiency
- Better success rates for operations
- Additional capacity (holdings, gates, etc.)
- Gameplay advantages of any kind

This is a hard line. Breaking it would destroy the game's integrity.

**Why This Matters:**

- Maintains competitive fairness
- Builds player trust
- Creates level playing field
- Ensures long-term health
- Differentiates from predatory competitors

### 12.2 Revenue Streams

**Cosmetic Items ($2-10)**

- Visual themes (Cyberpunk, Corporate, Retro, Military)
- System appearance customization
- Connection style variations
- UI skins
- Cargo animation styles
- Empire emblems/logos
- Animated backgrounds

**Quality of Life ($5-15/month subscription)**

- Parallel build queues (start 2-3 builds simultaneously)
- Advanced analytics dashboard (better data visualization)
- Historical replay (watch your empire evolution)
- Enhanced notification system
- Custom alerts and filters
- Multi-account management tools
- No ads (if free version has them)

**Vanity Metrics (Free + Shareable)**

- "Your network moved 10M units of cargo"
- "You've earned 5M credits all-time"
- Network efficiency score vs. server average
- Achievement badges
- Rank history graphs
- Public profiles (opt-in)

**Key Point:** QoL features save time but don't provide strategic advantage. A free player can achieve everything a paying player can; paying players just have better tools to manage complexity.

---

## 13. References and Inspirations

### 13.1 OGame

**What We Borrowed:**

- Asynchronous time model (check in 2-3 times daily)
- Construction timers over real-world hours/days
- Espionage and intelligence gathering
- Fleet saving mechanics (adapted to infrastructure protection)
- Alliance systems and diplomacy
- The "revenge loop" psychological hook

**What We Improved:**

- No instant combat; replaced with economic warfare
- Multi-stage operations instead of instant effects
- No "game over" through single attack
- Geographic progression instead of static universe
- Natural constraints instead of arbitrary caps

**Why OGame Worked:**

- Time investment creates attachment
- Delayed gratification builds anticipation
- Paranoia about attacks creates engagement
- Social bonds (alliances) increase retention
- Simple mechanics, deep strategy

### 13.2 Transport Tycoon Deluxe

**What We Borrowed:**

- Core loop: Build routes → Watch cargo → Earn money → Expand
- Visual satisfaction of watching network operate
- Optimization puzzle of efficient networks
- Competition over routes, not combat
- Geographic expansion pressure
- No artificial constraints on creativity

**What We Adapted:**

- Single-player → multiplayer competitive
- Real-time → asynchronous with timers
- Trains → space logistics
- Local map → galactic scale

**Why TTD Worked:**

- Watching things move is inherently satisfying
- Network optimization provides intellectual challenge
- Player expression through network design
- Clear cause-and-effect feedback
- "Just one more route" compulsion

### 13.3 Offworld Trading Company

**What We Borrowed:**

- Economic warfare as primary conflict
- Market manipulation mechanics
- Resource scarcity and competition
- Black market operations (adapted to intelligence ops)
- No military units or combat
- Victory through buyouts and economic dominance
- Supply chain vulnerabilities

**What We Improved:**

- Persistent world instead of 30-minute matches
- No instant sabotage (multi-stage operations)
- Reputation consequences (getting caught matters)
- Geographic strategy through distance
- Protected core (no total elimination)

**Why OTC Worked:**

- Proves economic warfare can be engaging
- Market manipulation is intellectually satisfying
- Sabotage feels strategic, not random
- Time pressure creates intensity
- Multiple viable strategies

### 13.4 Slipways

**What We Borrowed:**

- Minimal visual aesthetic
- Data-focused presentation
- Clean line-based network visualization
- Puzzle-like optimization challenge
- No combat focus

**What We Adapted:**

- Puzzle → competitive multiplayer
- Single-player → persistent world
- Abstract → slightly more simulation

**Why Slipways Worked:**

- Minimalism reduces cognitive load
- Focus on strategic decisions, not visual noise
- Quick to understand, deep to master
- Beautiful in its simplicity

### 13.5 Other Influences

**EVE Online:**

- Persistent universe with player-driven economy
- Intelligence and counter-intelligence
- Corporate structure and espionage
- Political meta-game
- Legendary player stories

**Civilization Series:**

- Wide vs. tall strategic choice
- Technology tree unlocking options
- Multiple victory conditions
- Turn-based strategic depth

**Factorio/Satisfactory:**

- Optimization satisfaction
- Watching production chains work
- Building complex systems
- Network visualization

**Board Games:**

- Brass: Birmingham (network effects, infrastructure)
- Power Grid (resource management, network building)
- Acquire (corporate mergers and growth)
- Dune (political maneuvering, resource control)

---

## 14. Design Decisions

### 14.1 Established Ideas

**No Ship Combat**

- Reason: Unrealistic and overdone in space games
- Benefit: Focuses on economic and strategic depth
- Trade-off: Less visceral/immediate than combat
- Verdict: Core to game identity, non-negotiable

**Asynchronous Time Model**

- Reason: Respects players' time, enables working adults to compete
- Benefit: Larger potential audience, less stressful
- Trade-off: Less immediacy than real-time
- Verdict: Essential for target audience

**Journey to the Center**

- Reason: Natural progression and player segmentation
- Benefit: Solves veteran/newcomer problem elegantly
- Trade-off: Requires large galaxy, complex balancing
- Verdict: Core progression system, implement Phase 4

**Subsidiary Model**

- Reason: Prevents total loss, maintains stakes
- Benefit: Can lose and recover, creates drama without elimination
- Trade-off: More complex than simple empire
- Verdict: Essential for persistent game health

**Light-Speed Information Lag**

- Reason: Realistic and creates strategic depth
- Benefit: Distance matters, intelligence becomes valuable
- Trade-off: Potentially confusing to players
- Verdict: Implement but ensure clarity (instant commands, delayed info)

**Multi-Stage Intelligence Operations**

- Reason: Creates tension over time, not instant
- Benefit: Fits asynchronous model, builds anticipation
- Trade-off: More complex than click-to-sabotage
- Verdict: Core differentiator from OTC-style sabotage

**Space Council NPC Governance**

- Reason: Provides structure without player admin burden
- Benefit: Fair, scales well, can add player voting later
- Trade-off: Less emergent drama than full player control
- Verdict: Start NPC, evolve to player influence gradually

**No Artificial Caps**

- Reason: Libertarian design philosophy, emergent limits
- Benefit: Player freedom, elegant design
- Trade-off: Harder to balance, risk of runaway growth
- Verdict: Commit to natural constraints, avoid lazy capping

**Ethical Monetization**

- Reason: Build trust, long-term sustainability
- Benefit: Player goodwill, competitive advantage
- Trade-off: Lower revenue potential
- Verdict: Core value, non-negotiable

### 14.2 Abandoned Ideas

**Ship-to-Ship Combat**

- Why Considered: Traditional space game expectation
- Why Abandoned: Unrealistic, doesn't fit economic focus, overdone in genre
- Replaced With: Economic warfare and intelligence operations

**Real-Time Gameplay**

- Why Considered: More immediate, exciting
- Why Abandoned: Excludes working adults, favors constant presence
- Replaced With: Asynchronous with time-based events

**Instant Sabotage (OTC Black Market Style)**

- Why Considered: Simpler to implement, immediate feedback
- Why Abandoned: No tension buildup, no risk assessment, no planning depth
- Replaced With: Multi-stage intelligence operations over days

**Territory Control (Civ-Style Borders)**

- Why Considered: Clear visual of control
- Why Abandoned: Unrealistic in space, limits emergent gameplay
- Replaced With: Infrastructure control and economic influence

**Private System Ownership**

- Why Considered: Clear property rights
- Why Abandoned: Unrealistic (can't blockade space), dystopian feel
- Replaced With: Infrastructure ownership within open systems

**Unlimited Resource Extraction**

- Why Considered: Simpler, avoids balancing complexity
- Why Abandoned: No scarcity = no conflict over resources
- Replaced With: Three-tier scarcity model (unlimited/limited/regenerating)

**Arbitrary Empire Size Caps**

- Why Considered: Easy solution to balance
- Why Abandoned: Violates design philosophy, feels arbitrary
- Replaced With: Natural economic constraints (overhead, coordination costs)

**Player-Run Space Council from Launch**

- Why Considered: Maximum player agency, EVE-style politics
- Why Abandoned: Requires critical mass, admin burden, abuse potential
- Replaced With: NPC Council initially, evolve to player influence

**Periodic Universe Resets**

- Why Considered: Level playing field regularly
- Why Abandoned: Destroys long-term investment, kills motivation
- Replaced With: Migration system creates fresh starts without reset

**Complex Resource Chains from Start**

- Why Considered: Depth and simulation appeal
- Why Abandoned: Overwhelming for MVP, test core loop first
- Replaced With: Simple → complex progression (Phase 1 simple, Phase 4 complex)

### 14.3 Pros and Cons Analysis

**Economic Warfare Focus**

Pros:

- Novel in space 4X genre
- Intellectually engaging
- Realistic
- Multiple strategic approaches
- No twitch reflexes required

Cons:

- Less visceral than combat
- Harder to market ("no combat = boring?")
- Requires player education
- May not satisfy action-seeking players

Verdict: Accept trade-off; targeting cerebral strategy audience

---

**Asynchronous Time Model**

Pros:

- Accessible to working adults
- Respects player time
- Builds anticipation
- Enables global player base (no timezone issues)
- Lower stress than real-time

Cons:

- Less immediacy
- Can't respond instantly to threats
- Some players want real-time
- Delayed satisfaction

Verdict: Essential for target audience; embrace it

---

**Journey to Center Progression**

Pros:

- Elegant solution to veteran/newcomer problem
- Natural player segmentation
- Clear progression path
- Sci-fi coherent
- Creates content (abandoned infrastructure)
- Prestige system built-in

Cons:

- Requires large galaxy (development work)
- Complex balancing across rings
- One-way commitment may feel restrictive
- Risk of ring imbalances

Verdict: Worth complexity; solves major design problems

---

**Multi-Stage Intelligence Operations**

Pros:

- Creates tension over time
- Fits asynchronous model
- Requires planning and skill
- Risk/reward trade-offs
- Differentiates from competitors

Cons:

- More complex than instant sabotage
- Requires explanation
- Delayed gratification
- Could frustrate action-seekers

Verdict: Core differentiator; commit to depth

---

**No Artificial Caps**

Pros:

- Philosophically consistent
- Elegant design
- Player freedom
- Natural equilibrium
- Less balancing work long-term

Cons:

- Harder to prevent edge cases
- Risk of broken strategies
- Requires careful economic design
- Could allow runaway victories

Verdict: Trust in natural constraints; monitor and adjust

---

**Light-Speed Information Lag**

Pros:

- Realistic
- Creates strategic depth
- Distance matters
- Intelligence becomes valuable
- Natural empire size limiter

Cons:

- Potentially confusing
- Must clarify instant commands vs. delayed info
- Could frustrate if implemented wrong
- Requires player education

Verdict: Implement carefully with clear UX

---

## 15. Appendices

### 15.1 Terminology Glossary

**Jump Gate:** Permanent infrastructure connecting two star systems, enables cargo transit, owned by player

**Holding/Subsidiary:** Geographically-defined division of player's empire, can be acquired independently

**Reputation:** 0-100 score tracked by Space Council, affects transaction fees and opportunities

**Confirmed Violation:** Proven misbehavior (>90% confidence), recorded publicly, damages reputation

**Intelligence Operation:** Multi-stage covert action (surveillance → analysis → penetration → cover-up)

**Counter-Intelligence:** Defensive network detecting and attributing attacks

**Migration:** Moving HQ closer to galactic center, leaving infrastructure behind

**Abandoned Infrastructure:** Assets left behind during migration, claimable by others at 10% cost

**The Rim:** Outermost ring (50-45 LY from center), tutorial space

**The Core:** Innermost ring (0-5 LY from center), endgame for elite players

**Administrative Overhead:** Percentage of revenue consumed by coordination costs

**Light-Speed Lag:** Information delay based on distance, creates strategic uncertainty

**Premium Deposit:** Limited resource deposit, one extractor per deposit, first-come-first-served

**Exotic Resource:** Regenerating pool resource, multiple extractors possible, tragedy of commons

**Space Council:** NPC governance organization tracking violations and providing investigations

**Hostile Takeover:** Acquiring 51% stake in competitor holding, forced sale

**White Knight:** Friendly counter-bidder in hostile takeover situation

**Asset Strip:** Dismantling infrastructure before hostile takeover completes (reputation penalty)

**Protected Core:** Player's un-buyable starting assets, prevents total elimination

**Pariah:** Player with <20 reputation, faces severe penalties but can operate in margins

**Ghost:** Player who sabotages while maintaining clean reputation through cover-ups

**Intelligence Broker:** Neutral player specializing in gathering and selling information

**Cartel:** Player coalition controlling resource supply or setting prices collectively

### 15.2 Example Scenarios

**Scenario 1: The Newcomer's Rise**

Week 1:

- Player starts on Rim (48 LY from center)
- Tutorial systems: Basic ore and water
- Learns to connect systems and watch cargo flow
- Earns first 10,000 credits
- Scans 5 nearby systems

Week 2:

- Discovers strategic system with rare materials
- Builds extraction infrastructure
- Establishes profitable trade route
- Another newcomer also expanding nearby
- Race to claim best deposits

Week 3:

- Claims 2 premium deposits before competitor
- Competitor claims 3 others
- Both expanding, non-hostile competition
- Learning market dynamics
- Building reputation through completed contracts

Week 4:

- Accumulated 50,000 credits
- Meets migration requirements
- Decides to migrate to Outer Ring (40 LY)
- Abandons 3 marginal systems
- New players claim abandoned infrastructure
- Establishes presence in more competitive ring

**Outcome:** Natural progression without artificial brackets

---

**Scenario 2: The Intelligence War**

Day 1:

- Player A (veteran) controls valuable antimatter system
- Player B (rival) wants to disrupt them
- Player B deploys surveillance satellite near system
- Takes 2 hours to position, begins gathering intel

Day 2:

- Surveillance gathers data on Player A's operations
- Player A's counter-intel detects surveillance (70% confidence)
- Player A doesn't know who it is yet
- Player B analyzes data, finds vulnerability: undermanned relay station

Day 3:

- Player B plans operation targeting relay station
- Success probability: 65%
- Decides to proceed, invests 1,000 credits
- Operation begins, takes 12 hours to execute
- Player A upgrades security elsewhere (paranoid)

Day 4:

- Operation succeeds, relay station disrupted
- Player A's antimatter transport delayed 24 hours
- Player B invests 2,000 credits in expensive cover-up
- Player A loses ~5,000 credits revenue
- Player A files Council investigation

Day 5:

- Council investigates, probability analysis: 45% Player B, 30% Player C, 25% unknown
- Insufficient evidence (<90% threshold)
- Player A's investigation costs 500 credits
- No reputation change
- Player B successfully hidden

Day 6-7:

- Player A increases security spending
- Suspects Player B but can't prove it
- Player B planning next move
- Tension builds, neither certain of other's plans

**Outcome:** Multi-day cat-and-mouse creates engagement without instant gratification

---

**Scenario 3: The Hostile Takeover**

Week 1:

- Player X has "Gamma Holdings" worth $30,000
- Player Y wants to acquire it (rare resource deposits)
- Player Y has accumulated $80,000 capital
- Meets requirements (2x cost + Gamma <50% of Player X's empire)

Week 2:

- Player Y initiates takeover bid: $15,300 for 51%
- 48-hour window begins
- Player X notified immediately
- Player X assesses options

Player X's Position:

- Gamma Holdings: 30% of empire value
- Total portfolio: $100,000
- Liquid capital: $20,000

Player X's Options:

1. Accept: Get $15,300, lose holding, rebuild elsewhere
2. Defensive recap: Spend $19,125 to retain control (expensive)
3. Find White Knight: Ally counter-bids (need ally with capital)
4. Asset strip: Dismantle infrastructure, recover $8,000, reputation hit

Decision (Player X chooses):

- Contacts ally (Player Z) with proposal: buy Gamma for $20,000
- Player Z agrees (wants the deposits, trusts Player X)
- Player Z counter-bids $20,400
- Player Y can escalate but decides not worth it
- Player Z acquires Gamma Holdings
- Player X loses holding but to ally, gets $20,400
- Player Y frustrated but saved from overpaying

Week 3:

- Player X uses $20,400 to expand elsewhere
- Player Z integrates Gamma into operations
- Player Y plots revenge against Player X
- Network of relationships and grudges develops

**Outcome:** Buyout creates drama, shifting alliances, not simple elimination

---

**Scenario 4: Migration Decision**

Player Profile:

- Current position: Mid Ring (32 LY from center)
- Net worth: $150,000
- Holdings: 12 systems
- Reputation: 82 (good standing)
- Time in current ring: 4 months

Migration Analysis:

Current situation:

- Comfortable in Mid Ring
- Profitable operations
- Known competitors
- $5,000/week profit

Inner Ring opportunity:

- Better exotic resources
- Much tougher competition
- Higher overhead costs
- Migration cost: $50,000

Holdings fate:

- Systems 30-35 LY: Keep (close to new HQ)
- Systems 35-40 LY: Abandon (too far to manage)
- 5 holdings will be abandoned
- Worth ~$60,000 combined

Decision factors:

- Spend $50,000 to migrate
- Lose $60,000 in abandoned holdings
- Total cost: $110,000
- Remaining capital: $40,000 to compete in Inner Ring
- Risk: Undercapitalized for tougher competition

Player's choice: Wait

- Builds up to $250,000 first
- Then migration cost is manageable
- Can compete effectively in Inner Ring
- Migrate in 2 more months

Alternative player's choice: Go now

- Aggressive player risks early migration
- Relies on skill to overcome capital disadvantage
- Higher risk, potential higher reward
- May fail and need to rebuild

**Outcome:** Migration is meaningful commitment, not automatic progression

---

## Conclusion

Sol3000 represents an attempt to create a space 4X game that embraces realistic economics over fantastical warfare. By focusing on infrastructure, intelligence, and economic competition, it carves out a unique niche in the strategy game landscape.

The game's success depends on:

1. Proving the core loop (connect-watch-earn-expand) is engaging
2. Creating meaningful competition without frustrating new players
3. Building a meta-game of intelligence, reputation, and economic warfare
4. Respecting players' time while providing strategic depth
5. Maintaining ethical monetization to build trust

The phased development approach allows testing each core assumption before adding complexity. If Phase 1 (single-player economic loop) isn't fun, no amount of multiplayer, espionage, or politics will save it.

But if the foundation works, Sol3000 has the potential to offer something genuinely novel: a space strategy game where the most powerful weapon isn't a fleet of battleships, but a well-timed market manipulation that bankrupts your rival three weeks later.

**Next Steps:**

1. Implement Phase 1 MVP (Month 1)
2. Playtest rigorously
3. Iterate based on feedback
4. Proceed to Phase 2 only if core loop validates

**The Vision:** In five years, players tell stories not of epic space battles, but of the time they orchestrated a six-week intelligence operation that culminated in a hostile takeover worth millions, all while maintaining perfect reputation and never firing a shot.

That's Sol3000.

---

**End of Document**
