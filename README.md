# Stickman Archer Game

A responsive HTML5-based Stickman Archer game with realistic physics that works on both web and mobile devices.

## Features

- **Realistic Physics**: Advanced arrow physics with gravity, air resistance, and velocity-based trajectories
- **Responsive Design**: Automatically adapts to different screen sizes
- **Cross-Platform**: Works on desktop browsers and mobile devices
- **Touch Support**: Full touch controls for mobile gameplay
- **HTML5 Canvas**: Smooth 60 FPS rendering with visual effects
- **Enhanced Visuals**: Arrow trails, trajectory prediction, and power indicators
- **Precision Scoring**: Score based on accuracy (bullseye = 50 points, inner ring = 25 points, outer = 10 points)

## Physics System

### Realistic Arrow Mechanics
- **Gravity**: Arrows arc naturally due to gravitational pull
- **Air Resistance**: Arrows slow down over time for realistic flight patterns
- **Velocity Scaling**: Pull distance determines initial arrow velocity
- **Trajectory Prediction**: Visual dotted line shows predicted arrow path
- **Ground Collision**: Arrows bounce and stick in the ground realistically

### Visual Feedback
- **Power Indicator**: Color-coded power bar shows bow pull strength
- **Bow Animation**: Stickman's bow visually stretches based on pull strength
- **Arrow Trails**: Motion trails make arrow flight more visible
- **Rotational Physics**: Arrows rotate based on their velocity direction

## How to Play

### Desktop
- Click and drag away from the stickman to pull the bowstring
- The yellow line shows your aim direction
- The white dotted line predicts the arrow's trajectory
- Watch the power bar to gauge your shot strength
- Release the mouse button to shoot the arrow
- Hit targets for points (closer to center = more points)

### Mobile
- Touch and drag away from the stickman to pull the bowstring
- The yellow line shows your aim direction
- The white dotted line predicts the arrow's trajectory
- Watch the power bar to gauge your shot strength
- Release your finger to shoot the arrow
- Hit targets for points (closer to center = more points)

## Scoring System
- **Bullseye (center)**: 50 points
- **Inner Ring**: 25 points
- **Outer Ring**: 10 points

## Running the Game

1. Open `index.html` in any modern web browser
2. The game will automatically start and be ready to play
3. For mobile testing, you can use browser developer tools or access via mobile device

## File Structure

```
stickman-archer/
├── index.html      # Main HTML file
├── styles.css      # Responsive CSS styles
├── game.js         # Game logic with realistic physics
└── README.md       # This file
```

## Technical Details

### Physics Constants
- **Gravity**: 0.4 pixels/frame² for natural arc
- **Air Resistance**: 0.99 coefficient for gradual slowdown
- **Max Velocity**: 25 pixels/frame for balanced gameplay
- **Min Velocity**: 3 pixels/frame to prevent weak shots

### Performance Features
- **Canvas Resolution**: Automatically adjusts based on screen size
- **Aspect Ratio**: Maintains 16:9 ratio for consistent gameplay
- **Frame Rate**: Targets 60 FPS for smooth animation
- **Trail Management**: Limited trail length for performance
- **Collision Detection**: Precise circular collision for targets

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile, etc.)

## Development

The game is built with vanilla JavaScript and HTML5 Canvas. No external dependencies required.

### Key Physics Components

- **Velocity Calculation**: Based on pull distance and angle
- **Trajectory Simulation**: Real-time physics prediction
- **Air Resistance**: Gradual velocity reduction over time
- **Ground Interaction**: Bounce and friction effects
- **Collision System**: Accurate circular collision detection

### Visual Enhancements

- **Arrow Rotation**: Arrows orient based on velocity direction
- **Motion Trails**: Visual feedback for arrow movement
- **Power Visualization**: Real-time bow tension display
- **Trajectory Preview**: Dotted line trajectory prediction

## Future Enhancements

- Wind effects for additional physics complexity
- Multiple arrow types with different physics properties
- Particle effects for hits and impacts
- Advanced target types with different point values
- Obstacle courses requiring physics mastery
- Multiplayer physics-based competitions
