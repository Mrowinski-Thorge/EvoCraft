// EvoCraft Game - Professional Game Logic

// Game State
const GameState = {
    discoveredElements: new Set(['Feuer', 'Wasser', 'Erde', 'Luft']),
    elementCounts: new Map(),
    combinations: 0,
    currentEpoch: 'Steinzeit',
    achievements: [],
    timeline: [],
    settings: {
        particles: true,
        animations: true,
        sound: true,
        music: true,
        hints: true,
        autosave: true
    },
    lastSave: null
};

// Server Configuration
const SERVER_CONFIG = {
    url: 'https://evocraft-server.onrender.com',
    endpoints: {
        matchLogic: '/api/match-logic',
        maintenance: '/api/maintenance'
    },
    retryAttempts: 3,
    retryDelay: 1000
};

// Game Data
let craftingLogic = {};
let serverAvailable = false;

// Element Data with sprites and categories
const ELEMENT_DATA = {
    'Feuer': { sprite: 'fire.png', category: 'basic', icon: '🔥', rarity: 'common' },
    'Wasser': { sprite: 'water.png', category: 'basic', icon: '💧', rarity: 'common' },
    'Erde': { sprite: 'earth.png', category: 'basic', icon: '🌍', rarity: 'common' },
    'Luft': { sprite: 'air.png', category: 'basic', icon: '💨', rarity: 'common' },
    'Stein': { sprite: 'stone.png', category: 'basic', icon: '🪨', rarity: 'common' },
    'Holz': { sprite: 'wood.png', category: 'basic', icon: '🪵', rarity: 'common' },
    'Funken': { sprite: 'spark.png', category: 'basic', icon: '✨', rarity: 'uncommon' },
    'Feuerstelle': { sprite: 'fireplace.png', category: 'tech', icon: '🏛️', rarity: 'uncommon' },
    'Samen': { sprite: 'seed.png', category: 'life', icon: '🌱', rarity: 'common' },
    'Setzling': { sprite: 'sapling.png', category: 'life', icon: '🌿', rarity: 'uncommon' },
    'Schlamm': { sprite: 'mud.png', category: 'basic', icon: '🟫', rarity: 'common' },
    'Beil': { sprite: 'axe.png', category: 'tech', icon: '🪓', rarity: 'uncommon' },
    'Dampf': { sprite: 'steam.png', category: 'basic', icon: '☁️', rarity: 'common' },
    'Nebel': { sprite: 'fog.png', category: 'basic', icon: '🌫️', rarity: 'uncommon' },
    'Ziegel': { sprite: 'brick.png', category: 'tech', icon: '🧱', rarity: 'uncommon' }
};

// Epochs
const EPOCHS = [
    { name: 'Steinzeit', requiredElements: 0 },
    { name: 'Bronzezeit', requiredElements: 10 },
    { name: 'Eisenzeit', requiredElements: 25 },
    { name: 'Antike', requiredElements: 50 },
    { name: 'Mittelalter', requiredElements: 100 },
    { name: 'Renaissance', requiredElements: 150 },
    { name: 'Industriezeitalter', requiredElements: 200 },
    { name: 'Moderne', requiredElements: 300 },
    { name: 'Digitales Zeitalter', requiredElements: 400 },
    { name: 'Zukunft', requiredElements: 450 },
    { name: 'Singularität', requiredElements: 500 }
];

// Achievement Definitions
const ACHIEVEMENTS = [
    {
        id: 'first_combination',
        name: 'Erste Schritte',
        description: 'Führe deine erste Kombination durch',
        icon: '🎯',
        condition: () => GameState.combinations >= 1
    },
    {
        id: 'discover_10',
        name: 'Entdecker',
        description: 'Entdecke 10 verschiedene Elemente',
        icon: '🔍',
        condition: () => GameState.discoveredElements.size >= 10
    },
    {
        id: 'discover_50',
        name: 'Forscher',
        description: 'Entdecke 50 verschiedene Elemente',
        icon: '🔬',
        condition: () => GameState.discoveredElements.size >= 50
    },
    {
        id: 'discover_100',
        name: 'Wissenschaftler',
        description: 'Entdecke 100 verschiedene Elemente',
        icon: '🧑‍🔬',
        condition: () => GameState.discoveredElements.size >= 100
    },
    {
        id: 'fire_mastery',
        name: 'Feuermeister',
        description: 'Erschaffe 5 feuerbasierte Elemente',
        icon: '🔥',
        condition: () => {
            const fireElements = ['Feuer', 'Funken', 'Feuerstelle', 'Dampf'];
            return fireElements.filter(el => GameState.discoveredElements.has(el)).length >= 4;
        }
    }
];

// Loading Tips
const LOADING_TIPS = [
    "💡 Tipp: Kombiniere Feuer + Stein um Funken zu erzeugen!",
    "💡 Tipp: Wasser + Erde ergibt Schlamm - der Anfang des Lebens!",
    "💡 Tipp: Manche Elemente können mehrfach kombiniert werden!",
    "💡 Tipp: Entdecke alle Elemente einer Epoche um die nächste freizuschalten!",
    "💡 Tipp: Seltene Elemente haben einen goldenen Schimmer!",
    "💡 Tipp: Du kannst Elemente als Favoriten markieren für schnellen Zugriff!",
    "💡 Tipp: Die Enzyklopädie zeigt dir alle möglichen Kombinationen!",
    "💡 Tipp: Speichere regelmäßig deinen Fortschritt!"
];

// Initialize Game
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎮 EvoCraft wird initialisiert...');
    
    // Show random loading tip
    showLoadingTip();
    
    // Initialize game systems
    await initializeGame();
});

async function initializeGame() {
    try {
        // Update loading progress
        updateLoadingProgress(10, 'Verbinde mit Server...');
        
        // Check server and load crafting logic
        await loadCraftingLogic();
        
        updateLoadingProgress(40, 'Lade Spielstand...');
        
        // Load saved game state
        loadGameState();
        
        updateLoadingProgress(60, 'Initialisiere Spielelemente...');
        
        // Initialize UI components
        initializeUI();
        
        updateLoadingProgress(80, 'Bereite Spielwelt vor...');
        
        // Setup event handlers
        setupEventHandlers();
        
        updateLoadingProgress(100, 'Spiel bereit!');
        
        // Start game after short delay
        setTimeout(() => {
            hideLoadingScreen();
            showGame();
            
            // Show tutorial for new players
            if (GameState.combinations === 0) {
                showTutorial();
            }
            
            // Start autosave
            if (GameState.settings.autosave) {
                startAutosave();
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Fehler beim Initialisieren:', error);
        showError('Initialisierungsfehler', 'Das Spiel konnte nicht geladen werden. Bitte lade die Seite neu.');
    }
}

// Server Communication
async function loadCraftingLogic() {
    try {
        // First check maintenance status
        const maintenanceResponse = await fetchWithTimeout(
            `${SERVER_CONFIG.url}${SERVER_CONFIG.endpoints.maintenance}`,
            { method: 'GET' },
            5000
        );
        
        if (maintenanceResponse.ok) {
            const maintenanceData = await maintenanceResponse.json();
            if (maintenanceData.maintenance) {
                showServerAlert('⚠️ Server befindet sich im Wartungsmodus');
                serverAvailable = false;
                loadFallbackLogic();
                return;
            }
        }
        
        // Load crafting logic
        const response = await fetchWithTimeout(
            `${SERVER_CONFIG.url}${SERVER_CONFIG.endpoints.matchLogic}`,
            { method: 'GET' },
            5000
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success && data.data) {
            craftingLogic = data.data;
            serverAvailable = true;
            console.log('✅ Crafting-Logik geladen:', Object.keys(craftingLogic).length, 'Kombinationen');
        } else {
            throw new Error('Ungültige Server-Antwort');
        }
        
    } catch (error) {
        console.warn('⚠️ Server nicht erreichbar:', error);
        showServerAlert('⏳ Server startet... Lokaler Modus aktiv');
        serverAvailable = false;
        loadFallbackLogic();
    }
}

function loadFallbackLogic() {
    // Fallback crafting logic for offline mode
    craftingLogic = {
        'Feuer+Stein': 'Funken',
        'Stein+Feuer': 'Funken',
        'Funken+Holz': 'Feuer',
        'Holz+Funken': 'Feuer',
        'Feuer+Holz': 'Feuerstelle',
        'Holz+Feuer': 'Feuerstelle',
        'Wasser+Erde': 'Schlamm',
        'Erde+Wasser': 'Schlamm',
        'Feuer+Wasser': 'Dampf',
        'Wasser+Feuer': 'Dampf',
        'Luft+Wasser': 'Nebel',
        'Wasser+Luft': 'Nebel',
        'Schlamm+Feuer': 'Ziegel',
        'Feuer+Schlamm': 'Ziegel',
        'Stein+Holz': 'Beil',
        'Holz+Stein': 'Beil',
        'Erde+Wasser+Luft': 'Samen',
        'Samen+Wasser': 'Setzling',
        'Wasser+Samen': 'Setzling'
    };
    console.log('📦 Fallback-Logik geladen');
}

async function fetchWithTimeout(url, options, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// UI Initialization
function initializeUI() {
    // Render initial elements
    renderElements();
    
    // Update stats
    updateStats();
    
    // Setup workspace
    setupWorkspace();
    
    // Initialize panels
    initializePanels();
    
    // Update epoch display
    updateEpoch();
}

function renderElements() {
    const grid = document.getElementById('elementsGrid');
    grid.innerHTML = '';
    
    const searchQuery = document.getElementById('elementSearch').value.toLowerCase();
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    
    // Filter and sort elements
    const elements = Array.from(GameState.discoveredElements)
        .filter(element => {
            const matchesSearch = element.toLowerCase().includes(searchQuery);
            const elementData = ELEMENT_DATA[element];
            const matchesCategory = activeCategory === 'all' || elementData?.category === activeCategory;
            return matchesSearch && matchesCategory;
        })
        .sort();
    
    // Render each element
    elements.forEach(elementName => {
        const elementData = ELEMENT_DATA[elementName] || { icon: '❓', category: 'unknown', rarity: 'common' };
        
        const elementCard = document.createElement('div');
        elementCard.className = `element-card ${elementData.rarity}`;
        elementCard.draggable = true;
        elementCard.dataset.element = elementName;
        
        // Check if newly discovered
        if (GameState.timeline.length > 0) {
            const lastEntry = GameState.timeline[GameState.timeline.length - 1];
            if (lastEntry.result === elementName && Date.now() - lastEntry.timestamp < 5000) {
                elementCard.classList.add('new');
            }
        }
        
        elementCard.innerHTML = `
            <div class="element-icon">
                ${elementData.sprite ? 
                    `<img src="../assets/sprites/${elementData.sprite}" alt="${elementName}" onerror="this.style.display='none'; this.parentElement.innerHTML='${elementData.icon}'">` 
                    : elementData.icon}
            </div>
            <div class="element-name">${elementName}</div>
            ${GameState.elementCounts.get(elementName) > 1 ? 
                `<div class="element-count">${GameState.elementCounts.get(elementName)}</div>` : ''}
        `;
        
        // Add drag event listeners
        elementCard.addEventListener('dragstart', handleDragStart);
        elementCard.addEventListener('dragend', handleDragEnd);
        
        // Touch support
        elementCard.addEventListener('touchstart', handleTouchStart, {passive: false});
        
        grid.appendChild(elementCard);
    });
    
    // Show empty state if no elements
    if (elements.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Keine Elemente gefunden</div>';
    }
}

// Drag and Drop System
let draggedElement = null;
let dragGhost = null;
let touchData = {
    element: null,
    offsetX: 0,
    offsetY: 0
};

function handleDragStart(e) {
    draggedElement = e.target.closest('.element-card').dataset.element;
    e.target.classList.add('dragging');
    
    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-ghost';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    e.dataTransfer.effectAllowed = 'copy';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
    
    // Remove drag ghost
    const ghost = document.querySelector('.drag-ghost');
    if (ghost) ghost.remove();
}

// Touch Support
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const element = e.target.closest('.element-card');
    
    touchData.element = element.dataset.element;
    touchData.startX = touch.clientX;
    touchData.startY = touch.clientY;
    
    // Create touch ghost
    createTouchGhost(element, touch.clientX, touch.clientY);
    
    // Add touch move and end listeners
    document.addEventListener('touchmove', handleTouchMove, {passive: false});
    document.addEventListener('touchend', handleTouchEnd, {passive: false});
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    
    // Move ghost
    if (dragGhost) {
        dragGhost.style.left = touch.clientX + 'px';
        dragGhost.style.top = touch.clientY + 'px';
    }
    
    // Check if over workspace
    const workspace = document.getElementById('craftingArea');
    const rect = workspace.getBoundingClientRect();
    
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        workspace.querySelector('.crafting-workspace').classList.add('drag-over');
    } else {
        workspace.querySelector('.crafting-workspace').classList.remove('drag-over');
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    
    // Check drop location
    const workspace = document.getElementById('craftingArea');
    const rect = workspace.getBoundingClientRect();
    
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        // Calculate position relative to workspace
        const workspaceElement = workspace.querySelector('.crafting-workspace');
        const workspaceRect = workspaceElement.getBoundingClientRect();
        const x = touch.clientX - workspaceRect.left;
        const y = touch.clientY - workspaceRect.top;
        
        placeElement(touchData.element, x, y);
    }
    
    // Cleanup
    workspace.querySelector('.crafting-workspace').classList.remove('drag-over');
    if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
    }
    
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    touchData.element = null;
}

function createTouchGhost(element, x, y) {
    dragGhost = document.createElement('div');
    dragGhost.className = 'touch-ghost';
    dragGhost.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 60px;
        height: 60px;
        background: var(--ui-bg-tertiary);
        border: 2px solid var(--game-gold);
        border-radius: 10px;
        z-index: 9999;
        pointer-events: none;
        opacity: 0.8;
        transform: translate(-50%, -50%);
    `;
    
    const elementData = ELEMENT_DATA[element.dataset.element];
    dragGhost.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 30px;">
            ${elementData?.icon || '❓'}
        </div>
    `;
    
    document.body.appendChild(dragGhost);
}

// Workspace Management
function setupWorkspace() {
    const workspace = document.querySelector('.crafting-workspace');
    
    // Drag over events
    workspace.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        workspace.classList.add('drag-over');
    });
    
    workspace.addEventListener('dragleave', (e) => {
        if (e.target === workspace) {
            workspace.classList.remove('drag-over');
        }
    });
    
    workspace.addEventListener('drop', (e) => {
        e.preventDefault();
        workspace.classList.remove('drag-over');
        
        if (draggedElement) {
            const rect = workspace.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            placeElement(draggedElement, x, y);
        }
    });
}

let placedElements = [];

function placeElement(elementName, x, y) {
    const workspace = document.getElementById('workspaceElements');
    const workspaceRect = workspace.getBoundingClientRect();
    
    // Hide hint
    document.getElementById('workspaceHint').classList.add('hidden');
    
    // Create placed element
    const placedElement = document.createElement('div');
    placedElement.className = 'placed-element';
    placedElement.dataset.element = elementName;
    
    // Ensure element stays within workspace
    const elementSize = 80;
    const maxX = workspaceRect.width - elementSize;
    const maxY = workspaceRect.height - elementSize;
    
    x = Math.max(0, Math.min(x - elementSize/2, maxX));
    y = Math.max(0, Math.min(y - elementSize/2, maxY));
    
    placedElement.style.left = x + 'px';
    placedElement.style.top = y + 'px';
    
    const elementData = ELEMENT_DATA[elementName] || { icon: '❓' };
    
    placedElement.innerHTML = `
        <div class="placed-element-icon">
            ${elementData.sprite ? 
                `<img src="../assets/sprites/${elementData.sprite}" alt="${elementName}">` 
                : elementData.icon}
        </div>
        <div class="placed-element-name">${elementName}</div>
        <button class="placed-element-remove" onclick="removeElement(this)">×</button>
    `;
    
    workspace.appendChild(placedElement);
    
    // Add to placed elements array
    placedElements.push({
        element: placedElement,
        name: elementName,
        x: x,
        y: y
    });
    
    // Make it draggable
    makePlacedElementDraggable(placedElement);
    
    // Check for combinations
    checkCombinations();
    
    // Play sound effect
    if (GameState.settings.sound) {
        playSound('place');
    }
}

function makePlacedElementDraggable(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, {passive: false});
    
    function startDrag(e) {
        if (e.target.classList.contains('placed-element-remove')) return;
        
        isDragging = true;
        element.classList.add('dragging');
        
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        initialX = element.offsetLeft;
        initialY = element.offsetTop;
        
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', doDrag, {passive: false});
        document.addEventListener('touchend', stopDrag);
        
        e.preventDefault();
    }
    
    function doDrag(e) {
        if (!isDragging) return;
        
        const touch = e.touches ? e.touches[0] : e;
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        const workspace = element.parentElement;
        const workspaceRect = workspace.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        let newX = initialX + deltaX;
        let newY = initialY + deltaY;
        
        // Keep within bounds
        newX = Math.max(0, Math.min(newX, workspaceRect.width - elementRect.width));
        newY = Math.max(0, Math.min(newY, workspaceRect.height - elementRect.height));
        
        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
        
        // Update position in array
        const placedData = placedElements.find(p => p.element === element);
        if (placedData) {
            placedData.x = newX;
            placedData.y = newY;
        }
        
        e.preventDefault();
    }
    
    function stopDrag() {
        isDragging = false;
        element.classList.remove('dragging');
        
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', doDrag);
        document.removeEventListener('touchend', stopDrag);
        
        // Check combinations after moving
        checkCombinations();
    }
}

function removeElement(button) {
    const element = button.parentElement;
    const index = placedElements.findIndex(p => p.element === element);
    
    if (index !== -1) {
        placedElements.splice(index, 1);
        element.remove();
        
        // Show hint if workspace is empty
        if (placedElements.length === 0) {
            document.getElementById('workspaceHint').classList.remove('hidden');
        }
        
        // Play sound
        if (GameState.settings.sound) {
            playSound('remove');
        }
    }
}

// Combination System
function checkCombinations() {
    if (placedElements.length < 2) return;
    
    // Check all pairs
    for (let i = 0; i < placedElements.length; i++) {
        for (let j = i + 1; j < placedElements.length; j++) {
            const el1 = placedElements[i];
            const el2 = placedElements[j];
            
            // Calculate distance
            const distance = Math.sqrt(
                Math.pow(el1.x - el2.x, 2) + 
                Math.pow(el1.y - el2.y, 2)
            );
            
            // Check if close enough
            if (distance < 100) {
                attemptCombination(el1, el2);
                return; // Only process one combination at a time
            }
        }
    }
}

function attemptCombination(el1, el2) {
    const combo1 = `${el1.name}+${el2.name}`;
    const combo2 = `${el2.name}+${el1.name}`;
    
    const result = craftingLogic[combo1] || craftingLogic[combo2];
    
    if (result) {
        // Successful combination
        const centerX = (el1.x + el2.x) / 2 + 40;
        const centerY = (el1.y + el2.y) / 2 + 40;
        
        // Show effect
        if (GameState.settings.particles) {
            showCombinationEffect(centerX, centerY);
        }
        
        // Remove elements
        el1.element.style.opacity = '0';
        el2.element.style.opacity = '0';
        
        setTimeout(() => {
            el1.element.remove();
            el2.element.remove();
            
            // Remove from array
            placedElements = placedElements.filter(p => p !== el1 && p !== el2);
            
            // Add result
            const isNew = !GameState.discoveredElements.has(result);
            GameState.discoveredElements.add(result);
            
            // Update counts
            GameState.elementCounts.set(result, (GameState.elementCounts.get(result) || 0) + 1);
            GameState.combinations++;
            
            // Add to timeline
            addToTimeline(el1.name, el2.name, result);
            
            // Update UI
            renderElements();
            updateStats();
            checkAchievements();
            updateEpoch();
            
            // Show discovery popup if new
            if (isNew) {
                showDiscoveryPopup(result);
            }
            
            // Place result element
            placeElement(result, centerX, centerY);
            
            // Save game
            if (GameState.settings.autosave) {
                saveGameState();
            }
            
        }, 500);
        
        // Play success sound
        if (GameState.settings.sound) {
            playSound('success');
        }
        
    } else {
        // Failed combination
        showFailedCombination(el1, el2);
        
        // Play fail sound
        if (GameState.settings.sound) {
            playSound('fail');
        }
    }
}

// Effects
function showCombinationEffect(x, y) {
    const effectsLayer = document.getElementById('effectsLayer');
    
    const effect = document.createElement('div');
    effect.className = 'combination-effect';
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    
    effect.innerHTML = `
        <div class="combination-ring"></div>
        <div class="combination-glow"></div>
        <div class="combination-particles"></div>
    `;
    
    // Create particles
    const particlesContainer = effect.querySelector('.combination-particles');
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const angle = (i / 12) * Math.PI * 2;
        const distance = 100 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.animationDelay = Math.random() * 0.2 + 's';
        
        particlesContainer.appendChild(particle);
    }
    
    effectsLayer.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => effect.remove(), 1500);
}

function showFailedCombination(el1, el2) {
    // Shake elements
    el1.element.style.animation = 'shake 0.5s ease-out';
    el2.element.style.animation = 'shake 0.5s ease-out';
    
    setTimeout(() => {
        el1.element.style.animation = '';
        el2.element.style.animation = '';
    }, 500);
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Discovery Popup
function showDiscoveryPopup(elementName) {
    const popup = document.getElementById('discoveryPopup');
    const elementData = ELEMENT_DATA[elementName] || { icon: '❓', category: 'unknown' };
    
    // Update popup content
    document.getElementById('discoveryIcon').textContent = '✨';
    document.getElementById('discoveryName').textContent = elementName;
    
    const img = document.getElementById('discoveryImg');
    if (elementData.sprite) {
        img.src = `../assets/sprites/${elementData.sprite}`;
        img.style.display = 'block';
        img.onerror = () => {
            img.style.display = 'none';
            document.getElementById('discoveryIcon').textContent = elementData.icon;
        };
    } else {
        img.style.display = 'none';
        document.getElementById('discoveryIcon').textContent = elementData.icon;
    }
    
    // Add description based on element
    const descriptions = {
        'Funken': 'Der Anfang aller Technologie! Funken können Feuer entfachen.',
        'Feuerstelle': 'Ein kontrolliertes Feuer - der erste Schritt zur Zivilisation.',
        'Schlamm': 'Die Basis für Landwirtschaft und Keramik.',
        'Dampf': 'Die Kraft, die die industrielle Revolution antrieb!',
        'Beil': 'Das erste Werkzeug der Menschheit.'
    };
    
    document.getElementById('discoveryDesc').textContent = 
        descriptions[elementName] || 'Eine faszinierende neue Entdeckung!';
    
    // Show popup
    popup.style.display = 'flex';
    
    // Continue button
    document.getElementById('discoveryContinue').onclick = () => {
        popup.style.display = 'none';
    };
}

// Timeline
function addToTimeline(element1, element2, result) {
    const entry = {
        element1,
        element2,
        result,
        timestamp: Date.now()
    };
    
    GameState.timeline.unshift(entry);
    
    // Keep only last 100 entries
    if (GameState.timeline.length > 100) {
        GameState.timeline = GameState.timeline.slice(0, 100);
    }
}

// Stats and Progress
function updateStats() {
    document.getElementById('discoveredCount').textContent = GameState.discoveredElements.size;
    document.getElementById('combinationCount').textContent = GameState.combinations;
}

function updateEpoch() {
    const discovered = GameState.discoveredElements.size;
    
    // Find current epoch
    for (let i = EPOCHS.length - 1; i >= 0; i--) {
        if (discovered >= EPOCHS[i].requiredElements) {
            const newEpoch = EPOCHS[i].name;
            if (newEpoch !== GameState.currentEpoch) {
                GameState.currentEpoch = newEpoch;
                showEpochUnlock(newEpoch);
            }
            document.getElementById('currentEpoch').textContent = newEpoch;
            break;
        }
    }
}

function showEpochUnlock(epochName) {
    // Create epoch unlock notification
    const notification = document.createElement('div');
    notification.className = 'epoch-unlock';
    notification.innerHTML = `
        <div class="epoch-unlock-content">
            <div class="epoch-unlock-icon">🎉</div>
            <div class="epoch-unlock-title">Neue Epoche freigeschaltet!</div>
            <div class="epoch-unlock-name">${epochName}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Add epoch unlock styles
const epochStyle = document.createElement('style');
epochStyle.textContent = `
    .epoch-unlock {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: var(--ui-bg-secondary);
        border: 3px solid var(--game-gold);
        border-radius: 20px;
        padding: 30px 50px;
        box-shadow: var(--shadow-xl), var(--shadow-glow-strong);
        opacity: 0;
        transition: all 0.5s ease;
        z-index: 1500;
    }
    
    .epoch-unlock.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    
    .epoch-unlock-content {
        text-align: center;
    }
    
    .epoch-unlock-icon {
        font-size: 48px;
        margin-bottom: 10px;
    }
    
    .epoch-unlock-title {
        font-size: 1.2rem;
        color: var(--text-secondary);
        margin-bottom: 10px;
    }
    
    .epoch-unlock-name {
        font-family: var(--font-display);
        font-size: 2rem;
        color: var(--game-gold);
        font-weight: 700;
    }
`;
document.head.appendChild(epochStyle);

// Achievements
function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (!GameState.achievements.includes(achievement.id) && achievement.condition()) {
            unlockAchievement(achievement);
        }
    });
}

function unlockAchievement(achievement) {
    GameState.achievements.push(achievement.id);
    
    // Show achievement notification
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-icon">${achievement.icon}</div>
        <div class="achievement-notification-content">
            <div class="achievement-notification-title">Erfolg freigeschaltet!</div>
            <div class="achievement-notification-name">${achievement.name}</div>
            <div class="achievement-notification-desc">${achievement.description}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
    
    // Update achievements panel if open
    updateAchievementsPanel();
}

// Add achievement notification styles
const achievementStyle = document.createElement('style');
achievementStyle.textContent = `
    .achievement-notification {
        position: fixed;
        bottom: 100px;
        right: -400px;
        background: var(--ui-bg-secondary);
        border: 2px solid var(--game-gold);
        border-radius: 15px;
        padding: 20px;
        display: flex;
        gap: 15px;
        align-items: center;
        box-shadow: var(--shadow-lg), var(--shadow-glow);
        transition: right 0.5s ease;
        z-index: 1400;
        max-width: 350px;
    }
    
    .achievement-notification.show {
        right: 20px;
    }
    
    .achievement-notification-icon {
        font-size: 36px;
    }
    
    .achievement-notification-title {
        font-size: 0.9rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .achievement-notification-name {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--game-gold);
        margin: 5px 0;
    }
    
    .achievement-notification-desc {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(achievementStyle);

// Save/Load System
function saveGameState() {
    const saveData = {
        discoveredElements: Array.from(GameState.discoveredElements),
        elementCounts: Array.from(GameState.elementCounts),
        combinations: GameState.combinations,
        currentEpoch: GameState.currentEpoch,
        achievements: GameState.achievements,
        timeline: GameState.timeline.slice(0, 50), // Save only last 50
        settings: GameState.settings,
        lastSave: Date.now(),
        version: '1.0.0'
    };
    
    localStorage.setItem('evoCraftSave', JSON.stringify(saveData));
    GameState.lastSave = Date.now();
    
    console.log('💾 Spiel gespeichert');
}

function loadGameState() {
    const savedData = localStorage.getItem('evoCraftSave');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // Restore game state
            GameState.discoveredElements = new Set(data.discoveredElements || ['Feuer', 'Wasser', 'Erde', 'Luft']);
            GameState.elementCounts = new Map(data.elementCounts || []);
            GameState.combinations = data.combinations || 0;
            GameState.currentEpoch = data.currentEpoch || 'Steinzeit';
            GameState.achievements = data.achievements || [];
            GameState.timeline = data.timeline || [];
            GameState.settings = { ...GameState.settings, ...data.settings };
            GameState.lastSave = data.lastSave;
            
            console.log('💾 Spielstand geladen');
        } catch (error) {
            console.error('❌ Fehler beim Laden:', error);
        }
    }
}

function exportSaveCode() {
    const saveData = {
        d: Array.from(GameState.discoveredElements),
        c: GameState.combinations,
        a: GameState.achievements,
        e: GameState.currentEpoch,
        t: Date.now()
    };
    
    const compressed = btoa(JSON.stringify(saveData));
    return compressed;
}

function importSaveCode(code) {
    try {
        const decoded = atob(code);
        const data = JSON.parse(decoded);
        
        GameState.discoveredElements = new Set(data.d);
        GameState.combinations = data.c;
        GameState.achievements = data.a;
        GameState.currentEpoch = data.e;
        
        // Refresh UI
        renderElements();
        updateStats();
        updateEpoch();
        
        return true;
    } catch (error) {
        console.error('❌ Ungültiger Speichercode');
        return false;
    }
}

// Auto-save
function startAutosave() {
    setInterval(() => {
        if (GameState.settings.autosave) {
            saveGameState();
        }
    }, 30000); // Save every 30 seconds
}

// Event Handlers
function setupEventHandlers() {
    // Menu
    document.getElementById('menuBtn').addEventListener('click', () => {
        document.getElementById('sideMenu').classList.add('active');
    });
    
    document.getElementById('menuClose').addEventListener('click', () => {
        document.getElementById('sideMenu').classList.remove('active');
    });
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('active');
    });
    
    document.getElementById('settingsClose').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('active');
    });
    
    // Settings toggles
    document.getElementById('particlesToggle').addEventListener('change', (e) => {
        GameState.settings.particles = e.target.checked;
        saveGameState();
    });
    
    document.getElementById('animationsToggle').addEventListener('change', (e) => {
        GameState.settings.animations = e.target.checked;
        saveGameState();
    });
    
    document.getElementById('soundToggle').addEventListener('change', (e) => {
        GameState.settings.sound = e.target.checked;
        saveGameState();
    });
    
    document.getElementById('musicToggle').addEventListener('change', (e) => {
        GameState.settings.music = e.target.checked;
        saveGameState();
    });
    
    document.getElementById('hintsToggle').addEventListener('change', (e) => {
        GameState.settings.hints = e.target.checked;
        saveGameState();
    });
    
    document.getElementById('autosaveToggle').addEventListener('change', (e) => {
        GameState.settings.autosave = e.target.checked;
        saveGameState();
    });
    
    // Apply saved settings
    document.getElementById('particlesToggle').checked = GameState.settings.particles;
    document.getElementById('animationsToggle').checked = GameState.settings.animations;
    document.getElementById('soundToggle').checked = GameState.settings.sound;
    document.getElementById('musicToggle').checked = GameState.settings.music;
    document.getElementById('hintsToggle').checked = GameState.settings.hints;
    document.getElementById('autosaveToggle').checked = GameState.settings.autosave;
    
    // Save/Load buttons
    document.getElementById('saveGameBtn').addEventListener('click', () => {
        saveGameState();
        showNotification('✅ Spiel gespeichert!');
    });
    
    document.getElementById('loadGameBtn').addEventListener('click', () => {
        const code = prompt('Speichercode eingeben:');
        if (code && importSaveCode(code)) {
            showNotification('✅ Spiel geladen!');
        } else if (code) {
            showNotification('❌ Ungültiger Code!');
        }
    });
    
    document.getElementById('resetGameBtn').addEventListener('click', () => {
        if (confirm('Wirklich alle Fortschritte löschen?')) {
            localStorage.removeItem('evoCraftSave');
            location.reload();
        }
    });
    
    // Tutorial
    document.getElementById('tutorialBtn').addEventListener('click', () => {
        showTutorial();
    });
    
    // Search
    document.getElementById('elementSearch').addEventListener('input', renderElements);
    
    // Categories
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderElements();
        });
    });
    
    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const panel = item.dataset.panel;
            switchPanel(panel);
            
            // Update active state
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Mobile sidebar toggle
    if (window.innerWidth <= 768) {
        document.querySelector('.game-sidebar').classList.add('hidden');
        
        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle';
        toggleBtn.innerHTML = '📚';
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 20px;
            width: 50px;
            height: 50px;
            background: var(--ui-bg-secondary);
            border: 2px solid var(--game-gold);
            border-radius: 50%;
            font-size: 24px;
            z-index: 200;
            cursor: pointer;
        `;
        
        toggleBtn.addEventListener('click', () => {
            document.querySelector('.game-sidebar').classList.toggle('visible');
        });
        
        document.body.appendChild(toggleBtn);
        
        // Close sidebar on element click (mobile)
        document.getElementById('elementsGrid').addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && e.target.closest('.element-card')) {
                setTimeout(() => {
                    document.querySelector('.game-sidebar').classList.remove('visible');
                }, 300);
            }
        });
    }
    
    // Discovery popup continue
    document.getElementById('discoveryContinue').addEventListener('click', () => {
        document.getElementById('discoveryPopup').style.display = 'none';
    });
    
    // Timeline clear
    document.getElementById('clearTimeline').addEventListener('click', () => {
        if (confirm('Timeline wirklich löschen?')) {
            GameState.timeline = [];
            updateTimelinePanel();
            showNotification('📜 Timeline gelöscht');
        }
    });
}

// Panel Management
function initializePanels() {
    updateEncyclopediaPanel();
    updateAchievementsPanel();
    updateTimelinePanel();
}

function switchPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
    
    // Show selected panel
    switch(panelName) {
        case 'workspace':
            // Just hide panels, workspace is always visible
            break;
        case 'encyclopedia':
            document.getElementById('encyclopediaPanel').style.display = 'flex';
            updateEncyclopediaPanel();
            break;
        case 'achievements':
            document.getElementById('achievementsPanel').style.display = 'flex';
            updateAchievementsPanel();
            break;
        case 'timeline':
            document.getElementById('timelinePanel').style.display = 'flex';
            updateTimelinePanel();
            break;
    }
}

function updateEncyclopediaPanel() {
    const grid = document.getElementById('encyclopediaGrid');
    grid.innerHTML = '';
    
    // Get all possible elements (you would need to define this)
    const allElements = Object.keys(ELEMENT_DATA);
    
    allElements.forEach(elementName => {
        const isDiscovered = GameState.discoveredElements.has(elementName);
        const elementData = ELEMENT_DATA[elementName];
        
        const item = document.createElement('div');
        item.className = `encyclopedia-item ${isDiscovered ? 'discovered' : 'undiscovered'}`;
        
        item.innerHTML = `
            <div class="element-icon">
                ${isDiscovered ? 
                    (elementData.sprite ? 
                        `<img src="../assets/sprites/${elementData.sprite}" alt="${elementName}">` 
                        : elementData.icon)
                    : '❓'}
            </div>
            <div class="element-name">${isDiscovered ? elementName : '???'}</div>
        `;
        
        if (isDiscovered) {
            item.addEventListener('click', () => {
                showElementDetails(elementName);
            });
        }
        
        grid.appendChild(item);
    });
    
    // Update progress
    document.getElementById('encyclopediaProgress').textContent = 
        `${GameState.discoveredElements.size} / ${allElements.length} Elemente entdeckt`;
}

function updateAchievementsPanel() {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = '';
    
    ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = GameState.achievements.includes(achievement.id);
        
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
        
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-progress">
                    <div class="achievement-progress-bar" style="width: ${isUnlocked ? '100' : '0'}%"></div>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    // Update progress
    const unlockedCount = GameState.achievements.length;
    const totalCount = ACHIEVEMENTS.length;
    document.getElementById('achievementProgress').textContent = 
        `${unlockedCount} / ${totalCount} Erfolge freigeschaltet`;
}

function updateTimelinePanel() {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';
    
    if (GameState.timeline.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">Noch keine Kombinationen durchgeführt</div>';
        return;
    }
    
    GameState.timeline.forEach(entry => {
        const timelineEntry = document.createElement('div');
        timelineEntry.className = 'timeline-entry';
        
        const time = new Date(entry.timestamp).toLocaleTimeString();
        
        timelineEntry.innerHTML = `
            <div class="timeline-time">${time}</div>
            <div class="timeline-content">
                <div class="timeline-elements">
                    <div class="timeline-element">
                        ${ELEMENT_DATA[entry.element1]?.icon || '❓'} ${entry.element1}
                    </div>
                    <div class="timeline-arrow">+</div>
                    <div class="timeline-element">
                        ${ELEMENT_DATA[entry.element2]?.icon || '❓'} ${entry.element2}
                    </div>
                    <div class="timeline-arrow">→</div>
                    <div class="timeline-result">
                        ${ELEMENT_DATA[entry.result]?.icon || '❓'} ${entry.result}
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(timelineEntry);
    });
}

// Tutorial System
function showTutorial() {
    const overlay = document.getElementById('tutorialOverlay');
    overlay.style.display = 'flex';
    
    const steps = [
        {
            title: 'Willkommen bei EvoCraft!',
            text: 'Beginne deine evolutionäre Reise mit den vier Grundelementen: Feuer, Wasser, Erde und Luft.'
        },
        {
            title: 'Elemente kombinieren',
            text: 'Ziehe Elemente aus der Seitenleiste in den Arbeitsbereich. Bringe zwei Elemente nahe zusammen, um sie zu kombinieren.'
        },
        {
            title: 'Neue Entdeckungen',
            text: 'Jede erfolgreiche Kombination schaltet neue Elemente frei. Experimentiere und entdecke über 500 verschiedene Elemente!'
        },
        {
            title: 'Fortschritt verfolgen',
            text: 'Schalte Erfolge frei, steige durch Epochen auf und werde zum Meister der Evolution!'
        }
    ];
    
    let currentStep = 0;
    
    function showStep(index) {
        const step = steps[index];
        document.getElementById('tutorialTitle').textContent = step.title;
        document.getElementById('tutorialText').textContent = step.text;
        
        // Update buttons
        const nextBtn = document.getElementById('tutorialNext');
        nextBtn.textContent = index === steps.length - 1 ? 'Los geht\'s!' : 'Weiter';
    }
    
    showStep(0);
    
    document.getElementById('tutorialNext').onclick = () => {
        currentStep++;
        if (currentStep >= steps.length) {
            overlay.style.display = 'none';
        } else {
            showStep(currentStep);
        }
    };
    
    document.getElementById('tutorialSkip').onclick = () => {
        overlay.style.display = 'none';
    };
}

// Utility Functions
function updateLoadingProgress(percent, status) {
    document.getElementById('loadingProgress').style.width = percent + '%';
    document.getElementById('loadingStatus').textContent = status;
}

function showLoadingTip() {
    const tip = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
    document.getElementById('loadingTip').textContent = tip;
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('gameLoading');
    loadingScreen.classList.add('hide');
    setTimeout(() => loadingScreen.style.display = 'none', 500);
}

function showGame() {
    document.getElementById('gameContainer').style.display = 'flex';
}

function showServerAlert(message) {
    const alert = document.getElementById('serverAlert');
    document.getElementById('serverAlertText').textContent = message;
    alert.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--ui-bg-secondary);
        border: 2px solid var(--game-gold);
        border-radius: 10px;
        padding: 15px 30px;
        z-index: 1500;
        animation: notificationSlide 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

function showError(title, message) {
    alert(`${title}\n\n${message}`);
}

function playSound(type) {
    // Sound implementation would go here
    // For now, just console log
    console.log(`🔊 Sound: ${type}`);
}

// Add notification animation
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes notificationSlide {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(notificationStyle);

// Performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Optimize search
document.getElementById('elementSearch').addEventListener('input', 
    debounce(renderElements, 300)
);

// Console Easter Egg
console.log('%c🧬 EvoCraft - Die Evolution beginnt!', 
    'color: #D4AF37; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
console.log('%cEntdecke alle Geheimnisse der Evolution...', 
    'color: #9CA3AF; font-size: 14px;');
    
// Export for debugging
window.GameState = GameState;
window.exportSave = exportSaveCode;
