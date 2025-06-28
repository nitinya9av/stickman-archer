// Game variables
let canvas, ctx;
let gameWidth, gameHeight;
let gameRunning = false;
let score = 0;

// Game statistics
let gameStats = {
    totalScore: 0,
    arrowsShot: 0,
    targetsHit: 0,
    bullseyeHits: 0,
    innerHits: 0,
    middleHits: 0,
    outerHits: 0,
    currentStreak: 0,
    bestStreak: 0,
    recentShots: []
};

// Level and challenge system
let currentLevel = 1;
let currentMode = 'classic';
let levelProgress = 0;
let levelTargets = 5;
let wind = { x: 0, y: 0, strength: 0, direction: 0 };
let obstacles = [];
let levelStartTime = 0;
let levelTimeLimit = 0;
let levelCompleting = false; // Add flag to prevent multiple level completions

// Available game modes
const GAME_MODES = {
    classic: {
        name: 'Classic',
        description: 'Standard archery practice',
        unlocked: true
    },
    moving: {
        name: 'Moving Targets',
        description: 'Targets that move around',
        unlocked: false,
        unlockLevel: 3
    },
    windy: {
        name: 'Windy Day',
        description: 'Wind affects arrow flight',
        unlocked: false,
        unlockLevel: 5
    },
    obstacles: {
        name: 'Obstacle Course',
        description: 'Navigate around barriers',
        unlocked: false,
        unlockLevel: 7
    },
    precision: {
        name: 'Precision Challenge',
        description: 'Smaller targets, higher scores',
        unlocked: false,
        unlockLevel: 10
    },
    timed: {
        name: 'Time Attack',
        description: 'Race against the clock',
        unlocked: false,
        unlockLevel: 12
    }
};

// Physics constants
const PHYSICS = {
    gravity: 0.4,
    airResistance: 0.99,
    maxVelocity: 25,
    minVelocity: 3,
    velocityScale: 0.15,
    groundLevel: 20
};

// Input handling
let isAiming = false;
let aimStartX = 0;
let aimStartY = 0;
let aimCurrentX = 0;
let aimCurrentY = 0;
let pullDistance = 0;
let pullAngle = 0;
let touchStartTime = 0;
let isValidAimingStart = false;

// Game objects
let stickman = {
    x: 100,
    y: 0,
    width: 40,
    height: 80,
    bowDrawn: false,
    bowPower: 0
};

let arrows = [];
let targets = [];

// Game timing
let lastTime = 0;
const targetFrameTime = 1000 / 60; // 60 FPS

// Hit effects system
let hitEffects = [];

// Initialize the game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    setupCanvas();
    setupEventListeners();
    initializeGame();
    
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

// Set up responsive canvas
function setupCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const aspectRatio = 16 / 9;
    let canvasWidth, canvasHeight;
    
    if (containerWidth / containerHeight > aspectRatio) {
        canvasHeight = containerHeight - 120; // Increased from 40 to make canvas shorter
        canvasWidth = canvasHeight * aspectRatio;
    } else {
        canvasWidth = containerWidth - 40;
        canvasHeight = canvasWidth / aspectRatio;
        // Ensure height doesn't exceed available space minus UI elements
        if (canvasHeight > containerHeight - 120) {
            canvasHeight = containerHeight - 120;
            canvasWidth = canvasHeight * aspectRatio;
        }
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    gameWidth = canvasWidth;
    gameHeight = canvasHeight;
    
    stickman.y = gameHeight - stickman.height - 20;
    
    console.log(`Canvas initialized: ${gameWidth}x${gameHeight}`);
}

// Set up event listeners for both desktop and mobile
function setupEventListeners() {
    window.addEventListener('resize', () => {
        setupCanvas();
    });
    
    canvas.addEventListener('mousedown', handleInputStart, { passive: false });
    canvas.addEventListener('mousemove', handleInputMove, { passive: false });
    canvas.addEventListener('mouseup', handleInputEnd, { passive: false });
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('selectstart', (e) => e.preventDefault());
    canvas.addEventListener('dragstart', (e) => e.preventDefault());
    
    let lastTouchEnd = 0;
    canvas.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            setupCanvas();
        }, 100);
    });
}

// Input handling functions
function handleInputStart(e) {
    const coords = getInputCoordinates(e);
    
    const stickmanCenterX = stickman.x + stickman.width / 2;
    const stickmanCenterY = stickman.y + stickman.height / 2;
    const distanceFromStickman = Math.sqrt(
        Math.pow(coords.x - stickmanCenterX, 2) + 
        Math.pow(coords.y - stickmanCenterY, 2)
    );
    
    isValidAimingStart = distanceFromStickman <= 150;
    
    aimStartX = coords.x;
    aimStartY = coords.y;
    aimCurrentX = aimStartX;
    aimCurrentY = aimStartY;
    isAiming = true;
    stickman.bowDrawn = true;
    stickman.bowPower = 0;
    touchStartTime = Date.now();
    
    if (navigator.vibrate && e.type.includes('touch')) {
        navigator.vibrate(10);
    }
}

function handleInputMove(e) {
    if (!isAiming) return;
    
    const coords = getInputCoordinates(e);
    aimCurrentX = coords.x;
    aimCurrentY = coords.y;
    
    updateAimingParameters();
    
    if (navigator.vibrate && e.type.includes('touch') && stickman.bowPower > 0.8) {
        const now = Date.now();
        if (now - touchStartTime > 500) {
            navigator.vibrate(5);
            touchStartTime = now;
        }
    }
}

function handleInputEnd(e) {
    if (!isAiming) return;
    
    if (pullDistance >= PHYSICS.minVelocity / PHYSICS.velocityScale) {
        shootArrow();
        
        if (navigator.vibrate && e.type.includes('touch')) {
            navigator.vibrate([10, 50, 10]);
        }
    } else {
        if (navigator.vibrate && e.type.includes('touch')) {
            navigator.vibrate(100);
        }
    }
    
    isAiming = false;
    stickman.bowDrawn = false;
    stickman.bowPower = 0;
    isValidAimingStart = false;
}

function getInputCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.type.includes('touch')) {
        const touch = e.touches[0] || e.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function handleTouchStart(e) {
    e.preventDefault();
    handleInputStart(e);
}

function handleTouchMove(e) {
    e.preventDefault();
    handleInputMove(e);
}

function handleTouchEnd(e) {
    e.preventDefault();
    handleInputEnd(e);
}

// Update aiming parameters
function updateAimingParameters() {
    const stickmanCenterX = stickman.x + stickman.width / 2;
    const stickmanCenterY = stickman.y + stickman.height / 2;
    
    const deltaX = aimCurrentX - stickmanCenterX;
    const deltaY = aimCurrentY - stickmanCenterY;
    
    pullDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    pullAngle = Math.atan2(deltaY, deltaX);
    
    const maxPullDistance = Math.min(gameWidth, gameHeight) * 0.4;
    stickman.bowPower = Math.min(pullDistance / maxPullDistance, 1);
    
    if (pullDistance < 20) {
        pullDistance = 0;
        stickman.bowPower = 0;
    }
}

// Initialize game objects
function initializeGame() {
    initializeLevel();
    updateScoringBoard();
    console.log('Game initialized');
}

// Initialize level based on current mode and level
function initializeLevel() {
    levelStartTime = Date.now();
    levelProgress = 0;
    levelCompleting = false; // Reset completion flag
    
    targets = [];
    obstacles = [];
    arrows = [];
    
    switch (currentMode) {
        case 'classic':
            initializeClassicLevel();
            break;
        case 'moving':
            initializeMovingLevel();
            break;
        case 'windy':
            initializeWindyLevel();
            break;
        case 'obstacles':
            initializeObstacleLevel();
            break;
        case 'precision':
            initializePrecisionLevel();
            break;
        case 'timed':
            initializeTimedLevel();
            break;
    }
    
    spawnLevelTargets();
    console.log(`Level ${currentLevel} (${currentMode}) initialized`);
}

function initializeClassicLevel() {
    levelTargets = Math.min(3 + currentLevel, 8);
    levelTimeLimit = 0;
    wind = { x: 0, y: 0, strength: 0, direction: 0 };
}

function initializeMovingLevel() {
    levelTargets = Math.min(4 + Math.floor(currentLevel / 2), 6);
    levelTimeLimit = 0;
    wind = { x: 0, y: 0, strength: 0, direction: 0 };
}

function initializeWindyLevel() {
    levelTargets = Math.min(3 + currentLevel, 7);
    levelTimeLimit = 0;
    
    const windStrength = Math.min(0.1 + (currentLevel * 0.05), 0.4);
    const windDirection = Math.random() * Math.PI * 2;
    
    wind = {
        x: Math.cos(windDirection) * windStrength,
        y: Math.sin(windDirection) * windStrength,
        strength: windStrength,
        direction: windDirection
    };
}

function initializeObstacleLevel() {
    levelTargets = Math.min(2 + currentLevel, 5);
    levelTimeLimit = 0;
    wind = { x: 0, y: 0, strength: 0, direction: 0 };
    
    const obstacleCount = Math.min(1 + Math.floor(currentLevel / 2), 4);
    for (let i = 0; i < obstacleCount; i++) {
        obstacles.push(createObstacle());
    }
}

function initializePrecisionLevel() {
    levelTargets = Math.min(2 + Math.floor(currentLevel / 2), 4);
    levelTimeLimit = 0;
    wind = { x: 0, y: 0, strength: 0, direction: 0 };
}

function initializeTimedLevel() {
    levelTargets = Math.min(5 + currentLevel, 10);
    levelTimeLimit = Math.max(60 - (currentLevel * 2), 30) * 1000;
    wind = { x: 0, y: 0, strength: 0, direction: 0 };
}

function createObstacle() {
    const types = ['wall', 'bouncer', 'spinner'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const obstacle = {
        type: type,
        x: gameWidth * 0.3 + Math.random() * gameWidth * 0.4,
        y: gameHeight * 0.2 + Math.random() * gameHeight * 0.5,
        width: 20 + Math.random() * 40,
        height: 40 + Math.random() * 80,
        rotation: 0,
        rotationSpeed: 0
    };
    
    if (type === 'spinner') {
        obstacle.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }
    
    return obstacle;
}

function spawnLevelTargets() {
    const targetCount = Math.min(2, levelTargets - levelProgress);
    
    for (let i = 0; i < targetCount; i++) {
        setTimeout(() => {
            spawnTarget();
        }, i * 1000);
    }
}

function spawnTarget() {
    const baseTarget = {
        x: gameWidth - 150 + Math.random() * 100,
        y: Math.random() * (gameHeight - 200) + 100,
        width: 60,
        height: 60,
        hit: false,
        spawnTime: Date.now()
    };
    
    switch (currentMode) {
        case 'moving':
            baseTarget.vx = (Math.random() - 0.5) * 2;
            baseTarget.vy = (Math.random() - 0.5) * 1;
            baseTarget.moving = true;
            break;
            
        case 'precision':
            const scale = Math.max(0.5, 1 - (currentLevel * 0.05));
            baseTarget.width *= scale;
            baseTarget.height *= scale;
            baseTarget.precision = true;
            break;
            
        case 'timed':
            baseTarget.timeLimit = 8000 - (currentLevel * 200);
            baseTarget.timed = true;
            break;
    }
    
    targets.push(baseTarget);
}
// Shoot arrow with realistic physics
function shootArrow() {
    const rawVelocity = pullDistance * PHYSICS.velocityScale;
    const velocity = Math.max(PHYSICS.minVelocity, Math.min(rawVelocity, PHYSICS.maxVelocity));
    
    if (velocity < PHYSICS.minVelocity) return;
    
    const vx = Math.cos(pullAngle) * velocity;
    const vy = Math.sin(pullAngle) * velocity;
    
    const arrow = {
        x: stickman.x + stickman.width,
        y: stickman.y + stickman.height / 2,
        vx: vx,
        vy: vy,
        initialVx: vx,
        initialVy: vy,
        rotation: pullAngle,
        active: true,
        trail: [],
        age: 0
    };
    
    arrows.push(arrow);
    
    gameStats.arrowsShot++;
    updateScoringBoard();
    
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
    updateLevelTimer();
    updateTargets();
    updateObstacles();
    
    for (let i = arrows.length - 1; i >= 0; i--) {
        const arrow = arrows[i];
        
        if (!arrow.active) continue;
        
        arrow.trail.push({ x: arrow.x, y: arrow.y });
        if (arrow.trail.length > 8) {
            arrow.trail.shift();
        }
        
        updateArrowPhysics(arrow);
        
        if (currentMode === 'windy') {
            arrow.vx += wind.x;
            arrow.vy += wind.y;
        }
        
        arrow.rotation = Math.atan2(arrow.vy, arrow.vx);
        arrow.age++;
        
        if (arrow.x > gameWidth + 50 || arrow.y > gameHeight || arrow.x < -50) {
            arrows.splice(i, 1);
            continue;
        }
        
        if (checkObstacleCollision(arrow)) {
            continue;
        }
        
        if (arrow.y >= gameHeight - PHYSICS.groundLevel) {
            if (arrow.vy > 2) {
                arrow.y = gameHeight - PHYSICS.groundLevel;
                arrow.vy *= -0.3;
                arrow.vx *= 0.7;
            } else {
                arrow.active = false;
                
                gameStats.currentStreak = 0;
                addRecentShot('miss', 0);
                updateScoringBoard();
                
                setTimeout(() => {
                    const index = arrows.indexOf(arrow);
                    if (index > -1) arrows.splice(index, 1);
                }, 2000);
            }
        }
        
        checkArrowTargetCollision(arrow, i);
    }
    
    updateHitEffects();
    checkLevelCompletion();
}

function updateTargets() {
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        
        if (target.moving && !target.hit) {
            target.x += target.vx;
            target.y += target.vy;
            
            if (target.x <= gameWidth * 0.5 || target.x >= gameWidth - target.width) {
                target.vx *= -1;
            }
            if (target.y <= 50 || target.y >= gameHeight - target.height - PHYSICS.groundLevel) {
                target.vy *= -1;
            }
        }
        
        if (target.timed && !target.hit) {
            const elapsed = Date.now() - target.spawnTime;
            if (elapsed > target.timeLimit) {
                targets.splice(i, 1);
                setTimeout(() => spawnTarget(), 500);
            }
        }
    }
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'spinner') {
            obstacle.rotation += obstacle.rotationSpeed;
        }
    });
}

function updateLevelTimer() {
    if (levelTimeLimit > 0) {
        const elapsed = Date.now() - levelStartTime;
        if (elapsed > levelTimeLimit) {
            console.log('Time limit reached!');
            initializeLevel();
        }
    }
}

function updateArrowPhysics(arrow) {
    arrow.vy += PHYSICS.gravity;
    arrow.vx *= PHYSICS.airResistance;
    arrow.vy *= PHYSICS.airResistance;
    
    arrow.x += arrow.vx;
    arrow.y += arrow.vy;
}
// Check obstacle collision
function checkObstacleCollision(arrow) {
    for (const obstacle of obstacles) {
        if (arrow.x > obstacle.x && arrow.x < obstacle.x + obstacle.width &&
            arrow.y > obstacle.y && arrow.y < obstacle.y + obstacle.height) {
            
            switch (obstacle.type) {
                case 'wall':
                    arrow.active = false;
                    return true;
                    
                case 'bouncer':
                    const centerX = obstacle.x + obstacle.width / 2;
                    const centerY = obstacle.y + obstacle.height / 2;
                    const dx = arrow.x - centerX;
                    const dy = arrow.y - centerY;
                    
                    if (Math.abs(dx) > Math.abs(dy)) {
                        arrow.vx *= -0.8;
                    } else {
                        arrow.vy *= -0.8;
                    }
                    
                    if (dx > 0) arrow.x = obstacle.x + obstacle.width + 5;
                    else arrow.x = obstacle.x - 5;
                    
                    return false;
                    
                case 'spinner':
                    const deflectionAngle = obstacle.rotation + Math.PI / 2;
                    const speed = Math.sqrt(arrow.vx * arrow.vx + arrow.vy * arrow.vy) * 0.7;
                    arrow.vx = Math.cos(deflectionAngle) * speed;
                    arrow.vy = Math.sin(deflectionAngle) * speed;
                    return false;
            }
        }
    }
    return false;
}

// Check collision between arrow and targets with ring zones
function checkArrowTargetCollision(arrow, arrowIndex) {
    for (let j = targets.length - 1; j >= 0; j--) {
        const target = targets[j];
        if (!target.hit) {
            const centerX = target.x + target.width / 2;
            const centerY = target.y + target.height / 2;
            const dx = arrow.x - centerX;
            const dy = arrow.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            let points = 0;
            let ringHit = '';
            
            if (distance <= 8) {
                points = 10;
                ringHit = 'bullseye';
                gameStats.bullseyeHits++;
            } else if (distance <= 15) {
                points = 5;
                ringHit = 'inner';
                gameStats.innerHits++;
            } else if (distance <= 22) {
                points = 3;
                ringHit = 'middle';
                gameStats.middleHits++;
            } else if (distance <= 30) {
                points = 1;
                ringHit = 'outer';
                gameStats.outerHits++;
            }
            
            if (points > 0) {
                target.hit = true;
                target.hitRing = ringHit;
                target.hitPoints = points;
                target.hitX = arrow.x;
                target.hitY = arrow.y;
                arrow.active = false;
                
                score += points;
                gameStats.totalScore += points;
                gameStats.targetsHit++;
                gameStats.currentStreak++;
                levelProgress++;
                
                console.log(`Target hit! Level progress: ${levelProgress}/${levelTargets}, Current level: ${currentLevel}`);
                
                if (gameStats.currentStreak > gameStats.bestStreak) {
                    gameStats.bestStreak = gameStats.currentStreak;
                }
                
                addRecentShot(ringHit, points);
                
                updateScore();
                updateScoringBoard();
                
                createHitEffect(centerX, centerY, points, ringHit);
                
                setTimeout(() => {
                    targets.splice(j, 1);
                    if (levelProgress < levelTargets && !levelCompleting) {
                        spawnTarget();
                    }
                }, 1500);
                
                break;
            }
        }
    }
}

function addRecentShot(ringHit, points) {
    const shot = {
        ring: ringHit,
        points: points,
        timestamp: Date.now()
    };
    
    gameStats.recentShots.unshift(shot);
    
    if (gameStats.recentShots.length > 8) {
        gameStats.recentShots.pop();
    }
}

function checkLevelCompletion() {
    // Prevent multiple level completions
    if (levelCompleting) return;
    
    if (levelProgress >= levelTargets) {
        levelCompleting = true; // Set flag to prevent multiple completions
        
        console.log(`Level ${currentLevel} completed! Progress: ${levelProgress}/${levelTargets}`);
        
        // Increment level
        currentLevel++;
        
        // Check for mode unlocks
        Object.keys(GAME_MODES).forEach(mode => {
            if (GAME_MODES[mode].unlockLevel && currentLevel >= GAME_MODES[mode].unlockLevel) {
                if (!GAME_MODES[mode].unlocked) {
                    GAME_MODES[mode].unlocked = true;
                    console.log(`${GAME_MODES[mode].name} mode unlocked!`);
                }
            }
        });
        
        // Initialize next level after a delay
        setTimeout(() => {
            initializeLevel();
        }, 2000);
        
        console.log(`Starting level ${currentLevel}`);
    }
}
// Enhanced visual hit effects system
function createHitEffect(x, y, points, ringHit) {
    console.log(`Hit ${ringHit}! +${points} points at (${x.toFixed(0)}, ${y.toFixed(0)})`);
    
    const scoreEffect = {
        x: x,
        y: y,
        points: points,
        ringHit: ringHit,
        age: 0,
        maxAge: 90,
        type: 'score'
    };
    hitEffects.push(scoreEffect);
    
    const particleCount = ringHit === 'bullseye' ? 15 : ringHit === 'inner' ? 12 : ringHit === 'middle' ? 8 : 6;
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 4;
        const particle = {
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            age: 0,
            maxAge: 30 + Math.random() * 30,
            size: 2 + Math.random() * 3,
            color: getHitColor(ringHit),
            type: 'particle'
        };
        hitEffects.push(particle);
    }
    
    const ringEffect = {
        x: x,
        y: y,
        radius: 5,
        maxRadius: ringHit === 'bullseye' ? 50 : ringHit === 'inner' ? 40 : 35,
        age: 0,
        maxAge: 25,
        color: getHitColor(ringHit),
        type: 'ring'
    };
    hitEffects.push(ringEffect);
}

function getHitColor(ringHit) {
    switch (ringHit) {
        case 'bullseye': return '#FFD700';
        case 'inner': return '#FF4444';
        case 'middle': return '#44FF44';
        case 'outer': return '#4444FF';
        default: return '#FFFFFF';
    }
}

function updateHitEffects() {
    for (let i = hitEffects.length - 1; i >= 0; i--) {
        const effect = hitEffects[i];
        effect.age++;
        
        if (effect.age >= effect.maxAge) {
            hitEffects.splice(i, 1);
            continue;
        }
        
        switch (effect.type) {
            case 'score':
                effect.y -= 1.5;
                break;
            case 'particle':
                effect.x += effect.vx;
                effect.y += effect.vy;
                effect.vx *= 0.95;
                effect.vy *= 0.95;
                break;
            case 'ring':
                const progress = effect.age / effect.maxAge;
                effect.radius = 5 + (effect.maxRadius - 5) * progress;
                break;
        }
    }
}

function drawHitEffects() {
    hitEffects.forEach(effect => {
        const alpha = 1 - (effect.age / effect.maxAge);
        
        switch (effect.type) {
            case 'score':
                drawScoreEffect(effect, alpha);
                break;
            case 'particle':
                drawParticleEffect(effect, alpha);
                break;
            case 'ring':
                drawRingEffect(effect, alpha);
                break;
        }
    });
}

function drawScoreEffect(effect, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = getHitColor(effect.ringHit);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    const text = `+${effect.points}`;
    ctx.strokeText(text, effect.x, effect.y);
    ctx.fillText(text, effect.x, effect.y);
    
    ctx.font = 'bold 16px Arial';
    const ringText = effect.ringHit.toUpperCase();
    ctx.strokeText(ringText, effect.x, effect.y + 25);
    ctx.fillText(ringText, effect.x, effect.y + 25);
    
    ctx.restore();
}

function drawParticleEffect(effect, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = effect.color;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawRingEffect(effect, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
// Render the game
function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, gameWidth, gameHeight);
    
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, gameHeight - PHYSICS.groundLevel, gameWidth, PHYSICS.groundLevel);
    
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < gameWidth; i += 20) {
        ctx.fillRect(i, gameHeight - PHYSICS.groundLevel + 5, 10, 2);
    }
    
    if (currentMode === 'windy') {
        drawWindIndicator();
    }
    
    obstacles.forEach(obstacle => {
        drawObstacle(obstacle);
    });
    
    drawStickman();
    
    if (isAiming) {
        drawAimingLine();
    }
    
    arrows.forEach(arrow => {
        if (arrow.active) {
            drawArrow(arrow);
        }
    });
    
    targets.forEach(target => {
        drawTarget(target);
    });
    
    drawHitEffects();
    drawLevelInfo();
    
    if (isAiming) {
        drawPhysicsInfo();
    }
}

function drawWindIndicator() {
    const windX = gameWidth - 100;
    const windY = 80;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(windX - 40, windY - 20, 80, 40);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(windX - 40, windY - 20, 80, 40);
    
    ctx.save();
    ctx.translate(windX, windY);
    ctx.rotate(wind.direction);
    
    const arrowLength = wind.strength * 60;
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(arrowLength, 0);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(arrowLength, 0);
    ctx.lineTo(arrowLength - 8, -4);
    ctx.lineTo(arrowLength - 8, 4);
    ctx.closePath();
    ctx.fillStyle = '#4CAF50';
    ctx.fill();
    
    ctx.restore();
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('WIND', windX, windY + 30);
    ctx.fillText(`${Math.round(wind.strength * 100)}%`, windX, windY + 45);
}

function drawObstacle(obstacle) {
    ctx.save();
    ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    ctx.rotate(obstacle.rotation);
    
    switch (obstacle.type) {
        case 'wall':
            ctx.fillStyle = '#666';
            ctx.fillRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 2;
            ctx.strokeRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
            break;
            
        case 'bouncer':
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(0, 0, obstacle.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#66BB6A';
            ctx.lineWidth = 3;
            ctx.stroke();
            break;
            
        case 'spinner':
            ctx.fillStyle = '#FF9800';
            ctx.beginPath();
            ctx.moveTo(0, -obstacle.height / 2);
            ctx.lineTo(obstacle.width / 4, 0);
            ctx.lineTo(0, obstacle.height / 2);
            ctx.lineTo(-obstacle.width / 4, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#FFB74D';
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
    }
    
    ctx.restore();
}

function drawLevelInfo() {
    const infoX = gameWidth / 2;
    const infoY = 30;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(infoX - 100, infoY - 15, 200, 30);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${currentLevel} - ${GAME_MODES[currentMode].name}`, infoX, infoY + 5);
    
    const progressY = infoY + 25;
    const progressWidth = 150;
    const progressHeight = 8;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(infoX - progressWidth / 2, progressY, progressWidth, progressHeight);
    
    const progressFill = (levelProgress / levelTargets) * progressWidth;
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(infoX - progressWidth / 2, progressY, progressFill, progressHeight);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(infoX - progressWidth / 2, progressY, progressWidth, progressHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`${levelProgress}/${levelTargets}`, infoX, progressY + 20);
    
    if (levelTimeLimit > 0) {
        const elapsed = Date.now() - levelStartTime;
        const remaining = Math.max(0, levelTimeLimit - elapsed);
        const seconds = Math.ceil(remaining / 1000);
        
        ctx.fillStyle = seconds <= 10 ? '#ff4444' : '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Time: ${seconds}s`, infoX, progressY + 40);
    }
}
function drawStickman() {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    const centerX = stickman.x + stickman.width / 2;
    const centerY = stickman.y + stickman.height / 2;
    
    ctx.beginPath();
    ctx.arc(centerX, stickman.y + 15, 12, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, stickman.y + 27);
    ctx.lineTo(centerX, stickman.y + 55);
    ctx.stroke();
    
    if (stickman.bowDrawn) {
        const stringTension = stickman.bowPower * 15;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 5);
        ctx.lineTo(centerX - 15, centerY);
        ctx.stroke();
        
        const pullX = centerX + 15 - stringTension;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 5);
        ctx.lineTo(pullX, centerY - 2);
        ctx.stroke();
        
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX + 15, centerY - 12);
        ctx.lineTo(centerX + 15, centerY + 12);
        ctx.stroke();
        
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX + 15, centerY - 12);
        ctx.lineTo(pullX, centerY - 2);
        ctx.lineTo(centerX + 15, centerY + 12);
        ctx.stroke();
        
        if (isAiming) {
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pullX, centerY - 2);
            ctx.lineTo(pullX - 20, centerY - 2);
            ctx.stroke();
            
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
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 5);
        ctx.lineTo(centerX - 15, centerY);
        ctx.moveTo(centerX, centerY - 5);
        ctx.lineTo(centerX + 15, centerY);
        ctx.stroke();
    }
    
    ctx.beginPath();
    ctx.moveTo(centerX, stickman.y + 55);
    ctx.lineTo(centerX - 12, stickman.y + 75);
    ctx.moveTo(centerX, stickman.y + 55);
    ctx.lineTo(centerX + 12, stickman.y + 75);
    ctx.stroke();
}

function drawAimingLine() {
    if (!isAiming) return;
    
    const stickmanCenterX = stickman.x + stickman.width / 2;
    const stickmanCenterY = stickman.y + stickman.height / 2;
    
    ctx.strokeStyle = isValidAimingStart ? 'rgba(255, 255, 0, 0.9)' : 'rgba(255, 100, 100, 0.7)';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    
    ctx.beginPath();
    ctx.moveTo(stickmanCenterX, stickmanCenterY);
    ctx.lineTo(aimCurrentX, aimCurrentY);
    ctx.stroke();
    
    if (pullDistance > PHYSICS.minVelocity / PHYSICS.velocityScale) {
        drawTrajectoryPrediction();
    }
    
    drawPowerIndicator();
    drawAimingAssistance();
    
    ctx.setLineDash([]);
}

function drawTrajectoryPrediction() {
    const velocity = Math.min(pullDistance * PHYSICS.velocityScale, PHYSICS.maxVelocity);
    const vx = Math.cos(pullAngle) * velocity;
    const vy = Math.sin(pullAngle) * velocity;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    
    let x = stickman.x + stickman.width;
    let y = stickman.y + stickman.height / 2;
    let currentVx = vx;
    let currentVy = vy;
    
    const points = [];
    
    for (let i = 0; i < 150; i++) {
        currentVy += PHYSICS.gravity;
        currentVx *= PHYSICS.airResistance;
        currentVy *= PHYSICS.airResistance;
        
        x += currentVx;
        y += currentVy;
        
        if (x > gameWidth || y > gameHeight - PHYSICS.groundLevel || x < 0) break;
        
        points.push({x, y});
    }
    
    points.forEach((point, index) => {
        if (index % 5 === 0) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - (index / points.length) * 0.6})`;
            ctx.fill();
        }
    });
    
    ctx.setLineDash([]);
}

function drawPowerIndicator() {
    const barWidth = Math.min(140, gameWidth * 0.2);
    const barHeight = 16;
    const barX = 25;
    const barY = gameHeight - 100;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8);
    
    const powerWidth = barWidth * stickman.bowPower;
    const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    
    if (stickman.bowPower < 0.3) {
        gradient.addColorStop(0, '#ff4444');
        gradient.addColorStop(1, '#ff6666');
    } else if (stickman.bowPower < 0.7) {
        gradient.addColorStop(0, '#ffaa00');
        gradient.addColorStop(1, '#ffcc44');
    } else {
        gradient.addColorStop(0, '#44ff44');
        gradient.addColorStop(1, '#66ff66');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, powerWidth, barHeight);
    
    for (let i = 1; i < 4; i++) {
        const markX = barX + (barWidth * i / 4);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(markX, barY);
        ctx.lineTo(markX, barY + barHeight);
        ctx.stroke();
    }
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Power: ${Math.round(stickman.bowPower * 100)}%`, barX, barY - 10);
    
    if (stickman.bowPower < PHYSICS.minVelocity / (PHYSICS.maxVelocity * PHYSICS.velocityScale)) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Pull more to shoot!', barX + barWidth/2, barY + barHeight + 25);
    }
}

function drawAimingAssistance() {
    const stickmanCenterX = stickman.x + stickman.width / 2;
    const stickmanCenterY = stickman.y + stickman.height / 2;
    
    if (!isValidAimingStart) {
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(stickmanCenterX, stickmanCenterY, 150, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Aim from here for best control', stickmanCenterX, stickmanCenterY - 170);
    }
    
    ctx.fillStyle = isValidAimingStart ? 'rgba(255, 255, 0, 0.9)' : 'rgba(255, 100, 100, 0.7)';
    ctx.beginPath();
    ctx.arc(aimCurrentX, aimCurrentY, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(aimCurrentX, aimCurrentY, 12, 0, Math.PI * 2);
    ctx.stroke();
    
    if (pullDistance > 15) {
        const angle = Math.round(pullAngle * 180 / Math.PI);
        const distance = Math.round(pullDistance);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(aimCurrentX - 50, aimCurrentY - 50, 100, 30);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${angle}° | ${distance}px`, aimCurrentX, aimCurrentY - 30);
    }
}
function drawArrow(arrow) {
    if (!arrow.active) return;
    
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
    
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.rotation);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-10, -1, 20, 2);
    
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(15, -3);
    ctx.lineTo(15, 3);
    ctx.closePath();
    ctx.fill();
    
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

function drawTarget(target) {
    const centerX = target.x + target.width / 2;
    const centerY = target.y + target.height / 2;
    const baseRadius = Math.min(target.width, target.height) / 2;
    
    if (target.hit) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        
        const flashIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = flashIntensity;
    }
    
    if (target.timed && !target.hit) {
        const elapsed = Date.now() - target.spawnTime;
        const remaining = Math.max(0, target.timeLimit - elapsed);
        const timerProgress = remaining / target.timeLimit;
        
        ctx.strokeStyle = timerProgress > 0.3 ? '#4CAF50' : '#ff4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + 8, -Math.PI / 2, 
                -Math.PI / 2 + (Math.PI * 2 * timerProgress));
        ctx.stroke();
    }
    
    ctx.fillStyle = target.hit ? '#666' : '#4444FF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = target.hit ? '#555' : '#44FF44';
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.73, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = target.hit ? '#444' : '#FF4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = target.hit ? '#333' : '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.27, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.73, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.27, 0, Math.PI * 2);
    ctx.stroke();
    
    if (!target.hit && baseRadius > 25) {
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        
        if (baseRadius > 30) {
            ctx.fillText('1', centerX + baseRadius * 0.85, centerY + 3);
            ctx.fillText('3', centerX + baseRadius * 0.6, centerY + 3);
            ctx.fillText('5', centerX + baseRadius * 0.35, centerY + 3);
            ctx.fillText('10', centerX, centerY + 3);
        }
    }
    
    if (target.moving && !target.hit) {
        const arrowLength = 15;
        const angle = Math.atan2(target.vy, target.vx);
        
        ctx.save();
        ctx.translate(centerX, centerY - baseRadius - 15);
        ctx.rotate(angle);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(arrowLength, 0);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(arrowLength, 0);
        ctx.lineTo(arrowLength - 5, -3);
        ctx.lineTo(arrowLength - 5, 3);
        ctx.closePath();
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        
        ctx.restore();
    }
    
    if (target.hit && target.hitX && target.hitY) {
        ctx.save();
        ctx.translate(target.hitX, target.hitY);
        ctx.rotate(Math.PI);
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-5, -1, 10, 2);
        
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-8, -2);
        ctx.lineTo(-7, 0);
        ctx.lineTo(-8, 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    if (target.hit) {
        ctx.restore();
    }
}

function drawPhysicsInfo() {
    const velocity = Math.min(pullDistance * PHYSICS.velocityScale, PHYSICS.maxVelocity);
    const angle = pullAngle * 180 / Math.PI;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.fillText(`Velocity: ${velocity.toFixed(1)}`, 20, gameHeight - 80);
    ctx.fillText(`Angle: ${angle.toFixed(1)}°`, 20, gameHeight - 65);
    ctx.fillText(`Pull: ${pullDistance.toFixed(0)}px`, 20, gameHeight - 95);
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateScoringBoard() {
    document.getElementById('total-score').textContent = gameStats.totalScore;
    document.getElementById('arrows-shot').textContent = gameStats.arrowsShot;
    document.getElementById('targets-hit').textContent = gameStats.targetsHit;
    
    const accuracy = gameStats.arrowsShot > 0 ? 
        Math.round((gameStats.targetsHit / gameStats.arrowsShot) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    document.getElementById('bullseye-count').textContent = gameStats.bullseyeHits;
    document.getElementById('bullseye-points').textContent = gameStats.bullseyeHits * 10;
    
    document.getElementById('inner-count').textContent = gameStats.innerHits;
    document.getElementById('inner-points').textContent = gameStats.innerHits * 5;
    
    document.getElementById('middle-count').textContent = gameStats.middleHits;
    document.getElementById('middle-points').textContent = gameStats.middleHits * 3;
    
    document.getElementById('outer-count').textContent = gameStats.outerHits;
    document.getElementById('outer-points').textContent = gameStats.outerHits * 1;
    
    document.getElementById('current-streak').textContent = gameStats.currentStreak;
    document.getElementById('best-streak').textContent = gameStats.bestStreak;
    
    updateRecentShotsList();
}

function updateRecentShotsList() {
    const shotsList = document.getElementById('recent-shots');
    
    if (gameStats.recentShots.length === 0) {
        shotsList.innerHTML = '<div class="no-shots">No shots yet</div>';
        return;
    }
    
    let shotsHTML = '';
    gameStats.recentShots.forEach((shot, index) => {
        if (shot.ring === 'miss') {
            shotsHTML += `
                <div class="shot-entry">
                    <div class="shot-ring">
                        <span class="shot-miss">Miss</span>
                    </div>
                    <div class="shot-points">0 pts</div>
                </div>
            `;
        } else {
            const color = getRingColor(shot.ring);
            shotsHTML += `
                <div class="shot-entry">
                    <div class="shot-ring">
                        <div class="shot-ring-color" style="background: ${color};"></div>
                        <span>${shot.ring.charAt(0).toUpperCase() + shot.ring.slice(1)}</span>
                    </div>
                    <div class="shot-points">+${shot.points} pts</div>
                </div>
            `;
        }
    });
    
    shotsList.innerHTML = shotsHTML;
}

function getRingColor(ringHit) {
    switch (ringHit) {
        case 'bullseye': return '#FFD700';
        case 'inner': return '#FF4444';
        case 'middle': return '#44FF44';
        case 'outer': return '#4444FF';
        default: return '#FFFFFF';
    }
}

function openModeSelector() {
    const selector = document.getElementById('mode-selector');
    selector.classList.add('active');
    selector.style.display = 'flex';
    
    updateModeCards();
}

function closeModeSelector() {
    const selector = document.getElementById('mode-selector');
    selector.classList.remove('active');
    selector.style.display = 'none';
}

function selectMode(mode) {
    if (!GAME_MODES[mode].unlocked) {
        return;
    }
    
    currentMode = mode;
    currentLevel = 1; // Reset to level 1 when changing modes
    levelCompleting = false; // Reset completion flag
    
    document.getElementById('current-mode-display').textContent = GAME_MODES[mode].name + ' Mode';
    
    initializeLevel();
    updateScoringBoard();
    
    closeModeSelector();
    
    console.log(`Switched to ${mode} mode, starting at level 1`);
}

function updateModeCards() {
    Object.keys(GAME_MODES).forEach(mode => {
        const card = document.querySelector(`.mode-card.${mode}`);
        const status = card.querySelector('.mode-status');
        
        if (GAME_MODES[mode].unlocked) {
            card.classList.remove('locked');
            status.textContent = 'Available';
            status.classList.remove('locked');
            status.classList.add('unlocked');
        } else {
            card.classList.add('locked');
            status.textContent = `Unlock at Level ${GAME_MODES[mode].unlockLevel}`;
            status.classList.remove('unlocked');
            status.classList.add('locked');
        }
        
        if (mode === currentMode) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

// Toggle scoring board visibility
function toggleScoringBoard() {
    const scoringBoard = document.getElementById('scoring-board');
    const toggleButton = document.getElementById('scoring-toggle');
    
    scoringBoard.classList.toggle('open');
    toggleButton.classList.toggle('open');
}

window.addEventListener('load', init);
