# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Python Weather Tool
```bash
cd tools/weather
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
- **Math Utilities**: Shared math utilities in `games/math/` including Vector2 and Mathf classes

### Key Game Components
- **StateMachine**: Manages game state transitions with enter/exit/update/draw lifecycle
- **Vector2.js**: Unity-style 2D vector math library with static utility methods
- **Game Classes**: Main game controllers that orchestrate all game systems  
- **Entity Classes**: Individual game objects (Ball, Paddle, Player, etc.)

### Weather Tool Integration
The weather tool demonstrates a complete data pipeline:
- Python script (`tools/weather/main.py`) fetches KNMI radar data
- Processes HDF5 radar files for Utrecht coordinates
- Generates JSON output for web display
- GitHub Actions automates data updates every 15 minutes
- Deployed to GitHub Pages at `/weather/` path

### Interactive Web Projects
- **Nature of Code**: Educational coding examples organized by chapter
- **Games**: Complete game implementations (Pong, Breakout, Flappy Bird)
- **Simulations**: Physics and mathematical simulations
- **Tools**: Utility web applications including weather forecast

## File Organization

### Games Structure
```
games/
├── [game-name]/
│   ├── main.js          # Main game entry point
│   ├── Game.js          # Core game class
│   ├── src/             # Game-specific components
│   ├── assets/          # Images, sounds, fonts
│   └── states/          # Game state implementations
```

### JavaScript Development
- ES6+ features with module imports/exports
- Class-based architecture for game components
- Modern browser compatibility

### GitHub Actions
- Weather data automation runs every 15 minutes
- Automatic deployment to GitHub Pages
- Secure API key management through GitHub Secrets