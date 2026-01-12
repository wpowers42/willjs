# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Python Weather Tool
```bash
cd weather
export KNMI_API_KEY="your_api_key_here"
python main.py
```
Fetches and processes weather radar data from KNMI API for Utrecht rainfall forecasts.

## Project Architecture

### Pure JavaScript Structure
The codebase is built entirely with vanilla JavaScript for maximum browser compatibility and simplicity.

### Game Development Pattern
Games follow a consistent architecture pattern:
- **State Machine**: Each game uses a state machine pattern (`StateMachine.js`) for managing game states (start, play, pause, game over)
- **Game Loop**: Fixed timestep game loop with accumulator pattern for consistent physics
- **Entity-Component**: Game objects (Ball, Paddle, Player) are separate classes with update/draw methods
- **Input Handling**: Centralized input handling through `InputHandler` classes
- **Math Utilities**: Vector2 and collision utilities (e.g., in `space-shooter/src/utils/`)

### Key Game Components
- **StateMachine**: Manages game state transitions with enter/exit/update/draw lifecycle
- **Vector2.js**: Unity-style 2D vector math library with static utility methods
- **Game Classes**: Main game controllers that orchestrate all game systems
- **Entity Classes**: Individual game objects (Ball, Paddle, Player, etc.)

### Weather Tool Integration
The weather tool demonstrates a complete data pipeline:
- Python script (`weather/main.py`) fetches KNMI radar data
- Processes HDF5 radar files for Utrecht coordinates
- Generates JSON output for web display
- GitHub Actions automates data updates every 5 minutes
- Deployed to GitHub Pages at `/weather/` path

## File Organization

All projects are organized as peer directories at the root level:
```
/
├── space-shooter/       # Games
├── lighting/
├── making-rays/
├── color-mixing-game/
├── fourier-transform/   # Simulations
├── projectile-area/
├── random-circle/
├── temperature/
├── box-breathing/       # Standalone apps
├── growth-model/
├── spot-it/
└── weather/             # Tools (Python + web)
```

### Project Structure Pattern
Simple projects use a minimal 3-file structure:
```
[project]/
├── index.html
├── script.js
└── style.css
```

Complex projects (like space-shooter) use a src/ subdirectory:
```
[project]/
├── index.html
├── script.js
├── style.css
└── src/
    ├── Game.js
    ├── entities/
    └── utils/
```

### JavaScript Development
- ES6+ features with module imports/exports
- Class-based architecture for game components
- Modern browser compatibility

### GitHub Actions
- Weather data automation runs every 15 minutes
- Automatic deployment to GitHub Pages
- Secure API key management through GitHub Secrets
