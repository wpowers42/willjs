# Space Shooter - Development Instructions

This file provides guidance for development of the Space Shooter game.

## Project Requirements

### Core Architecture
- **Pure Vanilla JavaScript**: No external frameworks or libraries allowed
- **HTML5 Canvas**: All graphics rendered using Canvas 2D API
- **Component-Based Design**: Modular game entities with clear separation of concerns
- **No TypeScript**: This project uses pure JavaScript for simplicity

### Code Standards
- Use ES6+ features (classes, arrow functions, const/let)
- Follow consistent naming conventions (camelCase for variables/functions, PascalCase for classes)
- Keep functions small and focused on single responsibilities
- Use meaningful variable and function names
- Add JSDoc comments for public methods and complex logic

### File Organization
- Each game entity should be in its own file
- Utility functions grouped in the `utils/` directory
- Keep the main game loop in `Game.js`
- UI logic separated in `UI.js`
- Store/upgrade system in dedicated `Store.js`

### Game Loop Requirements
- Fixed timestep game loop with accumulator pattern
- Target 60 FPS rendering
- Separate update and render phases
- Handle variable frame rates gracefully

### Performance Considerations
- Use object pooling for frequently created/destroyed objects (asteroids, projectiles, particles)
- Minimize garbage collection by reusing objects
- Efficient collision detection (spatial partitioning if needed)
- Optimize rendering calls

### Development Guidelines

1. **Always keep the README.md updated** as new features are implemented
2. **Test thoroughly** after each major component implementation
3. **Maintain clean code** - refactor when necessary
4. **Document design decisions** in commit messages
5. **Follow the established patterns** throughout the codebase
6. **NEVER suggest starting a python server** - the user manages their own local development server
7. **NEVER run npm type checks** - this project uses pure JavaScript, not TypeScript

### Game Balance
- Start with simple values and iterate based on gameplay feel
- Asteroid spawn rate should scale gradually
- Upgrade costs should scale appropriately with power
- City should be reasonably defensible but not trivial to protect

### Browser Compatibility
- Target modern browsers (ES6+ support)
- Test in Chrome, Firefox, Safari, and Edge
- Ensure responsive design works on different screen sizes
- Handle keyboard and mouse input gracefully

### Asset Management
- Keep asset files organized in the `assets/` directory
- Use efficient file formats (PNG for images, OGG/MP3 for audio)
- Implement proper asset loading with error handling
- Consider file sizes for web deployment

### Debugging
- Use browser developer tools effectively
- Add useful console logging for development
- Implement debug rendering modes if helpful
- Handle errors gracefully without crashing the game
