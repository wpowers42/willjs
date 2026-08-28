# Space Shooter Game

A planetary defense space shooter game featuring an integrated city-turret defensive system protecting against falling asteroids.

## Game Features

### Core Gameplay
- **Setting**: Planetary surface with integrated city defense system
- **Defensive Unit**: Turret integrated into city center at screen center
- **Objective**: Protect the space city from destruction by incoming asteroids
- **Enemies**: Asteroids with dynamic scaling based on cumulative score
- **Auto-Combat**: Distributed turrets fire predictively aimed projectiles

### Health System
- **Unified Defense**: Single health pool for the integrated city-turret system
- **City Health**: 10 health points + 5 shield points with regeneration
- **No Separate Turret Health**: Turret is part of city infrastructure
- **Asteroid Scaling**: Damage and speed scale with player score progression

### Points & Upgrades
- **Points**: Earned for each asteroid destroyed, displayed as currency
- **Score-Based Difficulty**: Asteroid properties scale with cumulative points
- **Integrated Upgrade System**: Real-time upgrade panel with direct purchasing
- **Available Upgrades**:
  - **Repair City**: Restore 3 health points (unlimited purchases)
  - **Fire Rate**: Increase turret fire rate by 15% per level (max 10)
  - **Damage**: Increase projectile damage by 1 per level (max 8)
  - **Additional Turret**: Add an evenly spaced, immune firing location (max 5 upgrades)
  - **Shield Upgrade**: Increase city shield capacity (max 3)
- **Purchase Method**: Click '+' buttons in upgrade panel, no pause required

### Game Mechanics
- **Integrated Defense**: City and turret function as single defensive unit
- **Predictive Projectiles**: Missiles lead moving targets at launch and then follow fixed trajectories
- **Threat-First Targeting**: Turrets prioritize the most dangerous uncovered asteroids
- **Target Distribution**: Each live threat receives coverage before turrets focus fire
- **Score-Based Progression**: Difficulty scales with cumulative points earned
- **Dynamic Asteroid Scaling**: Early asteroids are weaker, become stronger with score
- **Continuous Play**: Endless survival challenge with progressive difficulty
- **Pause System**: Game can be paused at any time for strategic breaks
- **Shield System**: City has regenerating shields for additional protection
- **Spawn Rate Scaling**: Asteroid spawn rate increases from 2000ms to 500ms based on score

## Technical Implementation

### Tech Stack
- Pure HTML5 Canvas for graphics
- Vanilla JavaScript (ES6+)
- CSS for styling
- No external libraries or frameworks

### Architecture
- Component-based game entities
- Fixed timestep game loop
- Object-oriented design
- Event-driven collision system

## File Structure

```
space-shooter/
├── index.html              # Main HTML file
├── style.css              # Game styling
├── script.js              # Main entry point
├── src/                   # Game components
│   ├── Game.js           # Main game class and loop
│   ├── Turret.js         # Legacy turret (visual compatibility)
│   ├── Asteroid.js       # Asteroid entities with score scaling
│   ├── Projectile.js     # Predictively aimed projectiles
│   ├── City.js           # Integrated city-turret defense system
│   ├── Store.js          # Complete upgrade and repair system
│   └── utils/
│       ├── Vector2.js    # 2D vector math
│       ├── Collision.js  # Collision detection
│       └── Utils.js      # General utilities
├── assets/               # Game assets
│   └── sounds/          # Audio effects
├── README.md            # This file
└── CLAUDE.md           # Development instructions
```

## Development Progress

### Phase 1: Foundation ✅
- [x] Create project structure
- [x] Project documentation
- [x] HTML canvas setup
- [x] Vector2 math utility
- [x] Main game loop

### Phase 2: Core Entities ✅
- [x] Turret implementation with auto-targeting
- [x] Asteroid system with 6 different types
- [x] City entity with detailed buildings
- [x] Collision detection system
- [x] Advanced rendering system

### Phase 3: Combat System ✅
- [x] Fixed-trajectory projectiles with predictive intercept aiming
- [x] Smart auto-targeting logic with threat assessment
- [x] Damage system with health management
- [x] Basic particle effects
- [x] Health bars and visual feedback

### Phase 4: Game Systems ✅
- [x] Dynamic asteroid spawning from multiple angles
- [x] Scoring system with points per asteroid type
- [x] Game over conditions
- [x] Pause functionality with spacebar
- [x] Complete UI with health and score display

### Phase 5: Upgrade System ✅
- [x] Complete integrated upgrade system with repair functionality
- [x] All upgrade categories implemented with real-time interface
- [x] Mouse-driven purchase system with progressive pricing
- [x] Eliminated separate store - direct panel integration
- [x] Points-based economy with always-visible status
- [x] Balance tuning for score-based progression

### Phase 6: Polish 🚧
- [x] Visual effects and animations
- [x] Starfield background with twinkling
- [x] Targeting indicators
- [x] Performance optimization
- [x] Responsive design
- [ ] Sound effects (lower priority - see Priority Tasks below)

## Priority Tasks

### High Priority (Core Gameplay) 🔥
- [x] **Projectile Target Locking**: Projectiles should 'lock' on to original target and only change if target is destroyed
- [x] **Danger-Based Turret Targeting**: Turret now prioritizes asteroid targets by danger - asteroids on collision course with city get highest priority, then closest ones
- [x] **Projectile Lock Release**: Projectiles should release lock on any asteroids below the screen
- [x] **Threat-First Targeting**: Projectiles prioritize the highest-threat asteroid
- [x] **Target Distribution System**: Projectiles cover unassigned threats before focus firing

### Medium Priority (User Experience) ⚡
- [ ] **Fix Play Again Functionality**: Auto-start next game and correctly reset all systems
- [ ] **Relocate Health Display**: Move health and shield status to be nearer the city

### Low Priority (UI Cleanup) 🧹
- [x] **Remove Duplicate Score Display**: Removed yellow score in top left and green city health in top right
- [x] **Remove Store Access**: Eliminated storefront accessible from pause menu, using only inset upgrade panel
- [x] **Health Display Format**: Updated Health/Shield values to display as integers instead of floats
- [ ] **Remove Unused Health Bar**: Remove the unused health bar for the turret

### Recent Major Updates ✅

#### **Version 2.2 - Intelligent Projectile Swarm**
- [x] **MAJOR**: Implemented 10 distinct projectile AI behaviors (Guardian, Hunter, Sniper, Interceptor, etc.)
- [x] **MAJOR**: Added deterministic targeting personality assignment using projectile IDs
- [x] **MAJOR**: Implemented target distribution system to prevent projectile clustering
- [x] **MAJOR**: Added spread factors and popularity penalties for coordinated targeting
- [x] **MINOR**: Removed duplicate UI elements (top score/health display)
- [x] **MINOR**: Eliminated separate store modal, keeping only inset upgrade panel
- [x] **MINOR**: Fixed Health/Shield display to show integers during regeneration

#### **Version 2.1 - Integrated Upgrade Interface**
- [x] **MAJOR**: Eliminated separate store - integrated upgrade panel in top left
- [x] **MAJOR**: Real-time clickable upgrade buttons with cost display
- [x] **MAJOR**: Rebranded "Score" to "Points" as visible currency system
- [x] **MAJOR**: Mouse interaction for direct upgrade purchasing during gameplay
- [x] **MAJOR**: Streamlined UI with always-visible upgrade status

#### **Version 2.0 - Integrated Defense System**
- [x] **MAJOR**: Integrated turret into city as single defensive unit
- [x] **MAJOR**: Repositioned city to screen center with integrated turret
- [x] **MAJOR**: Unified health system - single city health pool (10 health + 5 shields)
- [x] **MAJOR**: Score-based difficulty scaling instead of time-based
- [x] **MAJOR**: Complete store system with repair upgrades
- [x] **MAJOR**: Enhanced auto-seeking projectiles with predictive targeting

#### **Previous Updates**
- [x] Fixed starfield to use random star positions
- [x] Removed confusing armored asteroid squares
- [x] Added proper targeting indicators with animated crosshair
- [x] Fixed city/turret positioning for large canvases
- [x] Improved asteroid spawning patterns
- [x] Added planetary ground surface visual

## Open Questions

1. **Asteroid Spawning**: Random screen edges vs. top-only spawning?
2. **Turret Visuals**: Should turret rotate to face targets?
3. **Upgrade UI**: Grid, list, or tree layout for upgrades?
4. **Difficulty Curve**: How should spawn rate scale over time?
5. **Art Style**: Retro pixel art vs. modern minimalist design?
6. **Audio**: Background music needed in addition to sound effects?
7. **Persistence**: Save high scores between sessions?
8. **Screen Size**: Target resolution and responsive design approach?

## Controls

- **Spacebar**: Pause/Resume game
- **Mouse Click**: Purchase upgrades via '+' buttons in upgrade panel
- **R**: Restart game (when game over)
- **D**: Toggle debug information

## Current Game Status

🎮 **FULLY PLAYABLE** - Distributed defense turrets use predictive threat-first targeting.

### What's Working:
- ✅ **Predictive Ballistics** - Projectiles lead moving targets without heat-seeking after launch
- ✅ **Coordinated Targeting** - Turrets cover the highest-threat unassigned asteroids first
- ✅ **Integrated City-Turret Defense** - Single unified defensive structure
- ✅ **Real-Time Upgrade System** - Click '+' buttons to purchase upgrades instantly
- ✅ **Points-Based Economy** - Clear currency system integrated into gameplay
- ✅ **Score-Based Difficulty Scaling** - Dynamic progression based on performance
- ✅ **Predictively Aimed Projectiles** - Accurate intercept targeting with fixed trajectories
- ✅ **Mouse-Driven Interface** - Direct interaction with upgrade buttons
- ✅ **Unified Health System** - 10 health + 5 shields with regeneration
- ✅ **6 Dynamic Asteroid Types** - Properties scale with cumulative points
- ✅ **Highest-Threat Targeting** - City danger determines launch priority
- ✅ **Always-Visible Upgrade Panel** - No menu navigation required
- ✅ **Real-time Targeting** with animated crosshair indicators
- ✅ **Beautiful Starfield** with realistic twinkling effects over planet surface

### Victory Conditions

There are no victory conditions - the game is an endless survival challenge. The goal is to achieve the highest possible score before the city is destroyed.

### New in Version 2.2:
- **🤖 Threat-Priority AI**: Every turret uses the same city-focused danger assessment
- **🎯 Target Distribution**: Turrets cover unassigned threats before focus firing
- **🔍 Behavioral Specialization**: Guardians protect city, Hunters seek close targets, Snipers prefer distant ones
- **🎨 Clean Interface**: Removed duplicate UI elements for streamlined experience
- **🔢 Integer Display**: Health/Shield values now show as clean integers

### New in Version 2.1:
- **🖱️ Real-Time Interface**: Eliminated separate store - all upgrades accessible via mouse clicks
- **💰 Integrated Economy**: Points system with clear cost display and instant purchasing
- **🎮 Streamlined UX**: No pause/menu navigation required for upgrades
- **📊 Always-Visible Status**: Upgrade levels and costs permanently displayed
- **⚡ Instant Feedback**: Immediate upgrade application and visual confirmation

### New in Version 2.0:
- **🏗️ Architectural Redesign**: Complete integration of turret into city
- **⚖️ Smart Difficulty**: Score-based scaling replaces time-based progression
- **🛒 Full Store System**: Complete upgrade and repair functionality
- **🎯 Enhanced Targeting**: Launch-time interception prediction without heat-seeking
- **🛡️ Shield System**: Regenerating shields provide additional protection

### Planned Improvements:
- Advanced particle system enhancements
- Additional upgrade types and balancing
- Performance optimizations for large asteroid counts
- Enhanced visual effects and polish

*Note: Most immediate improvements have been moved to the Priority Tasks section above*
