# Stickman Archer Game

A responsive HTML5-based Stickman Archer game with realistic physics and multiple challenge modes that works on both web and mobile devices.

## Features

- **Realistic Physics**: Advanced arrow physics with gravity, air resistance, and velocity-based trajectories
- **Multiple Challenge Modes**: 6 different game modes with progressive difficulty
- **Responsive Design**: Automatically adapts to different screen sizes
- **Cross-Platform**: Works on desktop browsers and mobile devices
- **Touch Support**: Full touch controls with haptic feedback for mobile gameplay
- **HTML5 Canvas**: Smooth 60 FPS rendering with visual effects
- **Enhanced Visuals**: Arrow trails, trajectory prediction, particle effects, and power indicators
- **Comprehensive Statistics**: Detailed scoring breakdown and performance tracking
- **Progressive Unlocking**: New modes unlock as you advance through levels

## Challenge Modes & Levels

### 🎯 **Classic Mode** (Available from start)
- Standard archery practice with stationary targets
- Progressive difficulty with more targets per level
- Perfect for learning the game mechanics

### 🎪 **Moving Targets** (Unlocks at Level 3)
- Targets move horizontally and vertically
- Requires prediction and timing skills
- Targets bounce off screen boundaries

### 💨 **Windy Day** (Unlocks at Level 5)
- Wind affects arrow flight trajectory
- Wind strength and direction vary by level
- Visual wind indicator shows current conditions
- Requires compensation for wind drift

### 🧱 **Obstacle Course** (Unlocks at Level 7)
- Navigate arrows around barriers and obstacles
- Three obstacle types:
  - **Walls**: Stop arrows completely
  - **Bouncers**: Deflect arrows with energy loss
  - **Spinners**: Rotate and deflect arrows at angles
- Strategic aiming required to reach targets

### 🔍 **Precision Challenge** (Unlocks at Level 10)
- Smaller targets for increased difficulty
- Higher skill requirement for scoring
- Targets scale down with each level
- Rewards accuracy over power

### ⏱️ **Time Attack** (Unlocks at Level 12)
- Race against the clock to hit targets
- Individual target timers create urgency
- Time limits decrease with each level
- Fast decision-making required

## Progressive Difficulty System

### **Level Progression:**
- Each mode has independent level progression
- Difficulty increases with each level:
  - More targets to hit
  - Smaller targets (Precision mode)
  - Faster movement (Moving mode)
  - Stronger wind (Windy mode)
  - More obstacles (Obstacle mode)
  - Less time (Timed mode)

### **Unlock System:**
- New modes unlock based on overall level progress
- Unlocked modes remain available permanently
- Mode selector shows unlock requirements
- Visual indicators for locked/unlocked content

## Physics System

### Realistic Arrow Mechanics
- **Gravity**: Arrows arc naturally due to gravitational pull (0.4 pixels/frame²)
- **Air Resistance**: Arrows gradually slow down with 0.99 resistance coefficient
- **Velocity Scaling**: Pull distance determines initial arrow velocity (3-25 pixels/frame range)
- **Trajectory Prediction**: Real-time physics simulation for accurate flight paths
- **Ground Collision**: Arrows bounce and stick in the ground realistically

### Visual Feedback Systems
- **Power Indicator**: Color-coded power bar (red/yellow/green) shows bow pull strength
- **Enhanced Bow Animation**: Bowstring visually stretches based on pull distance
- **Arrow Trails**: Motion trails make arrow flight more visible and satisfying
- **Rotational Physics**: Arrows rotate realistically based on their velocity direction
- **Trajectory Preview**: White dotted line shows predicted arrow path

## Scoring System
- **🎯 Bullseye (Gold center)**: 10 points
- **🔴 Inner Ring (Red)**: 5 points  
- **🟢 Middle Ring (Green)**: 3 points
- **🔵 Outer Ring (Blue)**: 1 point

## Visual Feedback
- **Hit Effects**: Particle bursts and expanding rings when targets are hit
- **Floating Score Text**: Points and ring name appear above hit targets
- **Color-Coded Rings**: Each scoring zone has distinct colors
- **Arrow Embedding**: Arrows stick in targets showing exact hit location
- **Target Flashing**: Hit targets flash to indicate successful hits
- **Comprehensive Statistics**: Real-time tracking of all performance metrics

## How to Play

### Desktop Controls
- Click and drag away from the stickman to aim your bow
- The yellow line shows your aim direction
- The white dotted trajectory line predicts the arrow's path
- Watch the power bar to gauge your shot strength
- Release the mouse button to shoot the arrow

### Mobile Controls (Optimized)
- **Touch and drag** away from the stickman to aim your bow
- **Visual guides** help with aiming:
  - Yellow circle around stickman shows optimal aiming area
  - Yellow line shows your aim direction
  - White dotted trajectory shows predicted arrow path
  - Power meter with percentage display
  - Real-time angle and distance information
- **Haptic feedback** provides tactile responses:
  - Light vibration when starting to aim
  - Stronger vibration at high power levels
  - Success/failure feedback when shooting
- **Adaptive interface** scales to your screen size
- **Touch-optimized** visual elements for better visibility

### Universal Features
- **Unified controls** work seamlessly on both desktop and mobile
- **Responsive design** adapts to any screen size or orientation
- **Visual feedback** provides clear aiming assistance
- **No separate code paths** - same smooth experience everywhere

## Running the Game

1. Open `index.html` in any modern web browser
2. The game will automatically start in Classic mode
3. Use the mode selector at the top to switch between different challenges
4. Progress through levels to unlock new game modes
5. For mobile testing, you can use browser developer tools or access via mobile device

## File Structure

```
stickman-archer/
├── index.html      # Main HTML file with responsive viewport settings
├── styles.css      # Comprehensive responsive CSS with mobile optimizations
├── game.js         # Complete game logic with realistic physics and challenge modes
└── README.md       # This documentation file
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
- **Memory Management**: Efficient cleanup of game objects and effects

### Mobile Optimizations
- **Touch-First Design**: Controls designed specifically for touch interaction
- **Haptic Feedback**: Vibration responses for aiming and shooting (where supported)
- **Visual Guidance**: 
  - Aiming circle shows optimal touch area
  - Enhanced trajectory prediction with larger dots
  - Power meter with percentage display
  - Real-time angle and distance feedback
- **Adaptive Scaling**: Interface elements scale based on screen size
- **Gesture Prevention**: Prevents unwanted zoom, scroll, and selection
- **Orientation Support**: Handles device rotation smoothly
- **Touch Target Optimization**: Larger, more accessible interface elements

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
- **Wind Simulation**: Realistic wind effects on arrow trajectory
- **Obstacle Physics**: Multiple collision types for different obstacles

### Visual Design Philosophy

#### **Minimalist Aesthetic Maintained:**
- Clean, uncluttered interface design
- Simple geometric shapes for obstacles
- Consistent color coding across all modes
- Subtle visual effects that enhance rather than distract
- Monochromatic ground and background elements

#### **Mode-Specific Visual Elements:**
- **Wind indicators**: Simple arrow showing direction and strength
- **Obstacle variety**: Basic shapes (rectangles, circles, diamonds)
- **Movement trails**: Minimal arrow indicators for moving targets
- **Timer rings**: Clean circular progress indicators
- **Size scaling**: Proportional target scaling maintains visual balance

#### **Progressive Enhancement:**
- Visual complexity increases gradually with levels
- New elements introduced one at a time
- Consistent visual language across all modes
- Performance-optimized rendering for smooth gameplay

### Advanced Game Systems

#### **Statistics Tracking:**
- **Real-time Updates**: All stats update immediately after each shot
- **Comprehensive Metrics**: Tracks accuracy, streaks, ring-specific hits
- **Recent Shots History**: Maintains list of last 8 shots with details
- **Performance Analytics**: Calculates accuracy percentages and trends

#### **Level Management:**
- **Progressive Difficulty**: Each mode scales difficulty appropriately
- **Unlock System**: Modes unlock based on overall progress
- **Mode Persistence**: Unlocked content remains available
- **Level Completion**: Automatic progression with visual feedback

#### **User Interface:**
- **Mode Selection**: Professional card-based interface
- **Real-time Feedback**: Live statistics and performance tracking
- **Visual Indicators**: Clear status displays for all game elements
- **Responsive Layout**: Adapts to all screen sizes and orientations

## Technical Features

### **Advanced Physics System:**
- **Wind simulation**: Realistic wind effects on arrow trajectory
- **Collision detection**: Multiple collision types for different obstacles
- **Bounce mechanics**: Energy-conserving deflection system
- **Movement patterns**: Smooth target movement with boundary detection

### **Performance Optimizations:**
- **Efficient rendering**: Optimized draw calls for multiple game objects
- **Memory management**: Proper cleanup of game objects and effects
- **Scalable difficulty**: Adaptive challenge scaling based on screen size
- **Smooth animations**: 60 FPS maintained across all challenge modes

## Future Enhancement Possibilities

- **Sound System**: Background music and sound effects
- **Particle Systems**: Enhanced visual effects for hits and impacts
- **Achievement System**: Unlockable achievements and rewards
- **Leaderboards**: High score tracking and comparison
- **Custom Levels**: Level editor for creating custom challenges
- **Multiplayer Support**: Real-time competitive gameplay
- **Arrow Varieties**: Different arrow types with unique physics properties
- **Weather Effects**: Rain, snow, and other environmental challenges

---

**Enjoy playing Stickman Archer!** 🏹🎯

*Built with vanilla JavaScript, HTML5 Canvas, and responsive CSS - no frameworks required.*
