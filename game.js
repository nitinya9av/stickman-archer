// Game variables
let canvas, ctx;
let gameWidth, gameHeight;
let gameRunning = false;
let score = 0;

// Physics constants
const PHYSICS = {
    gravity: 0.4,           // Gravity acceleration (pixels/frame²)
    airResistance: 0.99,    // Air resistance coefficient (0-1)
    maxVelocity: 25,        // Maximum initial velocity
    minVelocity: 3,         // Minimum velocity to shoot
    velocityScale: 0.15,    // Scale factor for converting pull distance to velocity
    groundLevel: 20         // Height of ground from bottom
};

// Input handling
let isAiming = false;
let aimStartX = 0;
let aimStartY = 0;
let aimCurrentX = 0;
let aimCurrentY = 0;
let pullDistance = 0;
let pullAngle = 0;

// Game objects
let stickman = {
    x: 100,
    y: 0,
    width: 40,
    height: 80,
    bowDrawn: false,
    bowPower: 0  // Visual indicator of bow pull strength
};

let arrows = [];
let targets = [];

// Game timing
let lastTime = 0;
const targetFrameTime = 1000 / 60; // 60 FPS

// Initialize the game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set up responsive canvas
    setupCanvas();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize game objects
    initializeGame();
    
    // Start game loop
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

// Set up responsive canvas
function setupCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate optimal canvas size maintaining aspect ratio
    const aspectRatio = 16 / 9;
    let canvasWidth, canvasHeight;
    
    if (containerWidth / containerHeight > aspectRatio) {
        canvasHeight = containerHeight - 40; // Leave some margin
        canvasWidth = canvasHeight * aspectRatio;
    } else {
        canvasWidth = containerWidth - 40; // Leave some margin
        canvasHeight = canvasWidth / aspectRatio;
    }
    
    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    gameWidth = canvasWidth;
    gameHeight = canvasHeight;
    
    // Set stickman ground position
    stickman.y = gameHeight - stickman.height - 20;
    
    console.log(`Canvas initialized: ${gameWidth}x${gameHeight}`);
}

// Set up event listeners for both desktop and mobile
function setupEventListeners() {
    // Resize handler
    window.addEventListener('resize', () => {
        setupCanvas();
    });
    
    // Mouse events (desktop)
    canvas.addEventListener('mousedown', handleInputStart);
    canvas.addEventListener('mousemove', handleInputMove);
    canvas.addEventListener('mouseup', handleInputEnd);
    
    // Touch events (mobile)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Prevent context menu on right click
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Input handling functions
function handleInputStart(e) {
    const rect = canvas.getBoundingClientRect();
    aimStartX = e.clientX - rect.left;
    aimStartY = e.clientY - rect.top;
    aimCurrentX = aimStartX;
    aimCurrentY = aimStartY;
    isAiming = true;
    stickman.bowDrawn = true;
    stickman.bowPower = 0;
}

function handleInputMove(e) {
    if (!isAiming) return;
    
    const rect = canvas.getBoundingClientRect();
    aimCurrentX = e.clientX - rect.left;
    aimCurrentY = e.clientY - rect.top;
    
    // Calculate pull distance and angle for visual feedback
    updateAimingParameters();
}

function handleInputEnd(e) {
    if (!isAiming) return;
    
    shootArrow();
    isAiming = false;
    stickman.bowDrawn = false;
    stickman.bowPower = 0;
}

// Touch event handlers
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    aimStartX = touch.clientX - rect.left;
    aimStartY = touch.clientY - rect.top;
    aimCurrentX = aimStartX;
    aimCurrentY = aimStartY;
    isAiming = true;
    stickman.bowDrawn = true;
    stickman.bowPower = 0;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isAiming) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    aimCurrentX = touch.clientX - rect.left;
    aimCurrentY = touch.clientY - rect.top;
    
    // Calculate pull distance and angle for visual feedback
    updateAimingParameters();
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!isAiming) return;
    
    shootArrow();
    isAiming = false;
    stickman.bowDrawn = false;
    stickman.bowPower = 0;
}

// Update aiming parameters for physics calculations
function updateAimingParameters() {
    const deltaX = aimStartX - aimCurrentX;
    const deltaY = aimStartY - aimCurrentY;
    
    pullDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    pullAngle = Math.atan2(deltaY, deltaX);
    
    // Update bow power for visual feedback (0-1)
    stickman.bowPower = Math.min(pullDistance / 150, 1);
}

// Initialize game objects
function initializeGame() {
    // Create initial targets
    spawnTarget();
    
    console.log('Game initialized');
}

// Spawn a new target
function spawnTarget() {
    const target = {
        x: gameWidth - 100,
        y: Math.random() * (gameHeight - 200) + 100,
        width: 60,
        height: 60,
        hit: false
    };
    targets.push(target);
}

// Shoot arrow with realistic physics
function shootArrow() {
    // Calculate initial velocity based on pull distance
    const rawVelocity = pullDistance * PHYSICS.velocityScale;
    const velocity = Math.max(PHYSICS.minVelocity, Math.min(rawVelocity, PHYSICS.maxVelocity));
    
    // Only shoot if minimum velocity is reached
    if (velocity < PHYSICS.minVelocity) return;
    
    // Calculate velocity components
    const vx = Math.cos(pullAngle) * velocity;
    const vy = Math.sin(pullAngle) * velocity;
    
    // Create arrow with realistic physics properties
    const arrow = {
        x: stickman.x + stickman.width,
        y: stickman.y + stickman.height / 2,
        vx: vx,
        vy: vy,
        initialVx: vx,
        initialVy: vy,
        rotation: pullAngle,  // Arrow rotation based on velocity direction
        active: true,
        trail: [],  // Trail for visual effect
        age: 0      // Age for trail management
    };
    
    arrows.push(arrow);
    
    console.log(`Arrow shot: velocity=${velocity.toFixed(2)}, angle=${(pullAngle * 180 / Math.PI).toFixed(1)}°`);
}

// Main game loop
function gameLoop(currentTime) {
    if (!gameRunning) return;
    
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime >= targetFrameTime) {
        update(deltaTime);
        render();
        lastTime = currentTime;
    }
    
    requestAnimationFrame(gameLoop);
}

// Update game logic
function update(deltaTime) {
    // Update arrows with realistic physics
    for (let i = arrows.length - 1; i >= 0; i--) {
        const arrow = arrows[i];
        
        if (!arrow.active) continue;
        
        // Store previous position for trail
        arrow.trail.push({ x: arrow.x, y: arrow.y });
        if (arrow.trail.length > 8) {
            arrow.trail.shift(); // Keep trail length manageable
        }
        
        // Apply physics
        updateArrowPhysics(arrow);
        
        // Update arrow rotation based on velocity
        arrow.rotation = Math.atan2(arrow.vy, arrow.vx);
        
        // Increment age
        arrow.age++;
        
        // Check bounds
        if (arrow.x > gameWidth + 50 || arrow.y > gameHeight || arrow.x < -50) {
            arrows.splice(i, 1);
            continue;
        }
        
        // Check ground collision
        if (arrow.y >= gameHeight - PHYSICS.groundLevel) {
            // Arrow hits ground - add some bounce or stick behavior
            if (arrow.vy > 2) {
                arrow.y = gameHeight - PHYSICS.groundLevel;
                arrow.vy *= -0.3; // Small bounce
                arrow.vx *= 0.7;  // Friction
            } else {
                // Arrow sticks in ground
                arrow.active = false;
                setTimeout(() => {
                    const index = arrows.indexOf(arrow);
                    if (index > -1) arrows.splice(index, 1);
                }, 2000); // Remove after 2 seconds
            }
        }
        
        // Check collision with targets
        checkArrowTargetCollision(arrow, i);
    }
}

// Update arrow physics with realistic calculations
function updateArrowPhysics(arrow) {
    // Apply gravity
    arrow.vy += PHYSICS.gravity;
    
    // Apply air resistance
    arrow.vx *= PHYSICS.airResistance;
    arrow.vy *= PHYSICS.airResistance;
    
    // Update position
    arrow.x += arrow.vx;
    arrow.y += arrow.vy;
}

// Check collision between arrow and targets
function checkArrowTargetCollision(arrow, arrowIndex) {
    for (let j = targets.length - 1; j >= 0; j--) {
        const target = targets[j];
        if (!target.hit) {
            const dx = arrow.x - (target.x + target.width / 2);
            const dy = arrow.y - (target.y + target.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // More precise circular collision detection
            if (distance < 30) {
                target.hit = true;
                arrow.active = false;
                
                // Calculate score based on accuracy (closer to center = more points)
                let points = 10;
                if (distance < 10) points = 50;      // Bullseye
                else if (distance < 20) points = 25; // Inner ring
                
                score += points;
                updateScore();
                
                // Visual feedback
                createHitEffect(target.x + target.width / 2, target.y + target.height / 2, points);
                
                // Spawn new target after a delay
                setTimeout(() => {
                    targets.splice(j, 1);
                    spawnTarget();
                }, 1000);
                
                break;
            }
        }
    }
}

// Create hit effect (placeholder for future particle system)
function createHitEffect(x, y, points) {
    console.log(`Hit! +${points} points at (${x.toFixed(0)}, ${y.toFixed(0)})`);
}

// Render the game
function render() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, gameWidth, gameHeight);
    
    // Draw ground
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, gameHeight - PHYSICS.groundLevel, gameWidth, PHYSICS.groundLevel);
    
    // Draw ground texture
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < gameWidth; i += 20) {
        ctx.fillRect(i, gameHeight - PHYSICS.groundLevel + 5, 10, 2);
    }
    
    // Draw stickman
    drawStickman();
    
    // Draw aiming line and trajectory
    if (isAiming) {
        drawAimingLine();
    }
    
    // Draw arrows
    arrows.forEach(arrow => {
        if (arrow.active) {
            drawArrow(arrow);
        }
    });
    
    // Draw targets
    targets.forEach(target => {
        drawTarget(target);
    });
    
    // Draw physics info (debug - can be removed)
    if (isAiming) {
        drawPhysicsInfo();
    }
}

// Draw physics debug information
function drawPhysicsInfo() {
    const velocity = Math.min(pullDistance * PHYSICS.velocityScale, PHYSICS.maxVelocity);
    const angle = pullAngle * 180 / Math.PI;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.fillText(`Velocity: ${velocity.toFixed(1)}`, 20, gameHeight - 80);
    ctx.fillText(`Angle: ${angle.toFixed(1)}°`, 20, gameHeight - 65);
    ctx.fillText(`Pull: ${pullDistance.toFixed(0)}px`, 20, gameHeight - 95);
}

// Draw stickman with enhanced bow animation
function drawStickman() {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    const centerX = stickman.x + stickman.width / 2;
    const centerY = stickman.y + stickman.height / 2;
    
    // Head
    ctx.beginPath();
    ctx.arc(centerX, stickman.y + 15, 12, 0, Math.PI * 2);
    ctx.stroke();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(centerX, stickman.y + 27);
    ctx.lineTo(centerX, stickman.y + 55);
    ctx.stroke();
    
    // Arms and bow
    if (stickman.bowDrawn) {
        // Bow string tension based on pull strength
        const stringTension = stickman.bowPower * 15;
        
        // Left arm (holding bow)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 5);
        ctx.lineTo(centerX - 15, centerY);
        ctx.stroke();
        
        // Right arm (pulling string)
        const pullX = centerX + 15 - stringTension;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 5);
        ctx.lineTo(pullX, centerY - 2);
        ctx.stroke();
        
        // Bow
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX + 15, centerY - 12);
        ctx.lineTo(centerX + 15, centerY + 12);
        ctx.stroke();
        
        // Bow string
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX + 15, centerY - 12);
        ctx.lineTo(pullX, centerY - 2);
        ctx.lineTo(centerX + 15, centerY + 12);
        ctx.stroke();
        
        // Arrow on string
        if (isAiming) {
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pullX, centerY - 2);
            ctx.lineTo(pullX - 20, centerY - 2);
            ctx.stroke();
            
            // Arrow head
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.moveTo(pullX - 20, centerY - 2);
            ctx.lineTo(pullX - 25, centerY - 5);
            ctx.lineTo(pullX - 25, centerY + 1);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
    } else {
        // Normal arms
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 5);
        ctx.lineTo(centerX - 15, centerY);
        ctx.moveTo(centerX, centerY - 5);
        ctx.lineTo(centerX + 15, centerY);
        ctx.stroke();
    }
    
    // Legs
    ctx.beginPath();
    ctx.moveTo(centerX, stickman.y + 55);
    ctx.lineTo(centerX - 12, stickman.y + 75);
    ctx.moveTo(centerX, stickman.y + 55);
    ctx.lineTo(centerX + 12, stickman.y + 75);
    ctx.stroke();
}

// Draw enhanced aiming line with trajectory prediction
function drawAimingLine() {
    if (!isAiming) return;
    
    // Draw pull line
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(stickman.x + stickman.width, stickman.y + stickman.height / 2);
    ctx.lineTo(aimCurrentX, aimCurrentY);
    ctx.stroke();
    
    // Draw trajectory prediction
    if (pullDistance > PHYSICS.minVelocity / PHYSICS.velocityScale) {
        drawTrajectoryPrediction();
    }
    
    // Draw power indicator
    drawPowerIndicator();
    
    ctx.setLineDash([]);
}

// Draw trajectory prediction
function drawTrajectoryPrediction() {
    const velocity = Math.min(pullDistance * PHYSICS.velocityScale, PHYSICS.maxVelocity);
    const vx = Math.cos(pullAngle) * velocity;
    const vy = Math.sin(pullAngle) * velocity;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    let x = stickman.x + stickman.width;
    let y = stickman.y + stickman.height / 2;
    let currentVx = vx;
    let currentVy = vy;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Simulate trajectory for prediction
    for (let i = 0; i < 100; i++) {
        currentVy += PHYSICS.gravity;
        currentVx *= PHYSICS.airResistance;
        currentVy *= PHYSICS.airResistance;
        
        x += currentVx;
        y += currentVy;
        
        if (x > gameWidth || y > gameHeight - PHYSICS.groundLevel || x < 0) break;
        
        if (i % 3 === 0) { // Draw every 3rd point for dotted effect
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw power indicator
function drawPowerIndicator() {
    const barWidth = 100;
    const barHeight = 10;
    const barX = 20;
    const barY = gameHeight - 50;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    // Power bar
    const powerWidth = barWidth * stickman.bowPower;
    const powerColor = stickman.bowPower < 0.3 ? '#ff4444' : 
                      stickman.bowPower < 0.7 ? '#ffaa00' : '#44ff44';
    
    ctx.fillStyle = powerColor;
    ctx.fillRect(barX, barY, powerWidth, barHeight);
    
    // Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('Power', barX, barY - 5);
}

// Draw arrow with enhanced visuals and trail
function drawArrow(arrow) {
    if (!arrow.active) return;
    
    // Draw trail
    if (arrow.trail.length > 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let i = 0; i < arrow.trail.length - 1; i++) {
            const alpha = (i / arrow.trail.length) * 0.3;
            ctx.globalAlpha = alpha;
            
            if (i === 0) {
                ctx.moveTo(arrow.trail[i].x, arrow.trail[i].y);
            } else {
                ctx.lineTo(arrow.trail[i].x, arrow.trail[i].y);
            }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    // Save context for rotation
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.rotation);
    
    // Arrow shaft
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-10, -1, 20, 2);
    
    // Arrow head
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(15, -3);
    ctx.lineTo(15, 3);
    ctx.closePath();
    ctx.fill();
    
    // Arrow fletching
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-15, -2);
    ctx.lineTo(-13, 0);
    ctx.lineTo(-15, 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Draw target
function drawTarget(target) {
    if (target.hit) {
        ctx.fillStyle = '#ff4444';
    } else {
        ctx.fillStyle = '#ff0000';
    }
    
    // Target circles
    ctx.beginPath();
    ctx.arc(target.x + target.width / 2, target.y + target.height / 2, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(target.x + target.width / 2, target.y + target.height / 2, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = target.hit ? '#ff4444' : '#ff0000';
    ctx.beginPath();
    ctx.arc(target.x + target.width / 2, target.y + target.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
}

// Start the game when page loads
window.addEventListener('load', init);
