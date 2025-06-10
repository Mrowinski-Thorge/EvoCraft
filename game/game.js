// EvoCraft Game JavaScript
class EvoCraftGame {
    constructor() {
        this.inventory = new Map(); // Objekt -> Anzahl
        this.discoveredObjects = new Set(['stone', 'wood']); // Startobjekte
        this.craftingAPI = 'https://your-api-domain.vercel.app'; // Deine private API URL
        this.objects = {
            stone: { name: 'Stein', icon: 'assets/sprites/stone.png' },
            wood: { name: 'Holz', icon: 'assets/sprites/wood.png' },
            spark: { name: 'Funken', icon: 'assets/sprites/spark.png' },
            fire: { name: 'Feuer', icon: 'assets/sprites/fire.png' },
            fireplace: { name: 'Feuerstelle', icon: 'assets/sprites/fireplace.png' }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadGameState();
        this.updateUI();
        this.showAvailableObjects();
    }
    
    setupEventListeners() {
        // Drag & Drop
        this.setupDragAndDrop();
        
        // Combine Button
        document.getElementById('combine-btn').addEventListener('click', () => {
            this.combineObjects();
        });
        
        // Control Buttons
        document.getElementById('save-btn').addEventListener('click', () => this.saveGame());
        document.getElementById('sound-btn').addEventListener('click', () => this.toggleSound());
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
    }
    
    setupDragAndDrop() {
        // Objekte draggable machen
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('object')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.object);
                e.target.style.opacity = '0.5';
            }
        });
        
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('object')) {
                e.target.style.opacity = '1';
            }
        });
        
        // Drop Zones
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const objectType = e.dataTransfer.getData('text/plain');
                this.placeObject(zone, objectType);
                zone.classList.remove('drag-over');
            });
        });
    }
    
    placeObject(zone, objectType) {
        const objectData = this.objects[objectType];
        if (!objectData) return;
        
        zone.innerHTML = `
            <div class="placed-object" data-object="${objectType}">
                <img src="${objectData.icon}" alt="${objectData.name}">
                <span class="placed-object-name">${objectData.name}</span>
                <button class="remove-object" onclick="game.removeObject('${zone.id}')">×</button>
            </div>
        `;
        zone.classList.add('filled');
        zone.dataset.object = objectType;
        
        this.checkCombination();
    }
    
    removeObject(zoneId) {
        const zone = document.getElementById(zoneId);
        zone.innerHTML = '<span class="drop-hint">Objekt ' + (zoneId.includes('1') ? '1' : '2') + '</span>';
        zone.classList.remove('filled');
        delete zone.dataset.object;
        
        this.checkCombination();
    }
    
    checkCombination() {
        const zone1 = document.getElementById('drop-zone-1');
        const zone2 = document.getElementById('drop-zone-2');
        const combineBtn = document.getElementById('combine-btn');
        
        if (zone1.dataset.object && zone2.dataset.object) {
            combineBtn.disabled = false;
        } else {
            combineBtn.disabled = true;
        }
    }
    
    async combineObjects() {
        const zone1 = document.getElementById('drop-zone-1');
        const zone2 = document.getElementById('drop-zone-2');
        const resultArea = document.getElementById('result-area');
        
        const object1 = zone1.dataset.object;
        const object2 = zone2.dataset.object;
        
        if (!object1 || !object2) return;
        
        try {
            // API Call zum privaten Repository
            const response = await fetch(`${this.craftingAPI}/api/craft?item1=${object1}&item2=${object2}`);
            const result = await response.json();
            
            if (result.success && result.result) {
                // Erfolgreiche Kombination
                this.showResult(result.result, resultArea, true);
                this.addToInventory(result.result);
                this.unlockObject(result.result);
            } else {
                // Fehlgeschlagene Kombination
                this.showResult(null, resultArea, false);
            }
        } catch (error) {
            console.error('Crafting API Error:', error);
            // Fallback zu lokaler Logik (für Development)
            this.localCombine(object1, object2, resultArea);
        }
        
        // Zones nach 2 Sekunden zurücksetzen
        setTimeout(() => {
            this.removeObject('drop-zone-1');
            this.removeObject('drop-zone-2');
            resultArea.innerHTML = '<span class="result-hint">Ergebnis</span>';
        }, 2000);
    }
    
    // Fallback lokale Kombinationen (für Development)
    localCombine(object1, object2, resultArea) {
        const combinations = {
            'stone+stone': 'spark',
            'spark+wood': 'fire',
            'fire+stone': 'fireplace'
        };
        
        const key = [object1, object2].sort().join('+');
        const result = combinations[key];
        
        if (result) {
            this.showResult(result, resultArea, true);
            this.addToInventory(result);
            this.unlockObject(result);
        } else {
            this.showResult(null, resultArea, false);
        }
    }
    
    showResult(result, resultArea, success) {
        if (success && result) {
            const objectData = this.objects[result];
            const isNew = !this.discoveredObjects.has(result);
            
            resultArea.innerHTML = `
                <div class="result-success">
                    <img src="${objectData.icon}" alt="${objectData.name}">
                    <span class="result-name">${objectData.name}</span>
                    ${isNew ? '<span class="result-new">Neu!</span>' : ''}
                </div>
            `;
        } else {
            resultArea.innerHTML = `
                <div class="result-failure">
                    ❌ Keine Kombination möglich
                </div>
            `;
        }
    }
    
    addToInventory(objectType) {
        const current = this.inventory.get(objectType) || 0;
        this.inventory.set(objectType, current + 1);
        this.updateInventoryDisplay();
    }
    
    unlockObject(objectType) {
        if (!this.discoveredObjects.has(objectType)) {
            this.discoveredObjects.add(objectType);
            this.showAvailableObjects();
        }
    }
    
    showAvailableObjects() {
        const objectsGrid = document.getElementById('available-objects');
        const objectElements = objectsGrid.querySelectorAll('.object');
        
        objectElements.forEach(element => {
            const objectType = element.dataset.object;
            if (this.discoveredObjects.has(objectType)) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    }
    
    updateInventoryDisplay() {
        const inventoryList = document.getElementById('inventory-list');
        const inventoryCount = document.getElementById('inventory-count');
        
        let totalItems = 0;
        let html = '';
        
        for (let [objectType, count] of this.inventory) {
            totalItems += count;
            const objectData = this.objects[objectType];
            html += `
                <div class="inventory-item">
                    <img src="${objectData.icon}" alt="${objectData.name}">
                    <span>${objectData.name}</span>
                    <span style="margin-left: auto; font-weight: 600;">${count}x</span>
                </div>
            `;
        }
        
        inventoryList.innerHTML = html || '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">Inventar ist leer</div>';
        inventoryCount.textContent = totalItems;
    }
    
    saveGame() {
        const gameState = {
            inventory: Array.from(this.inventory.entries()),
            discoveredObjects: Array.from(this.discoveredObjects),
            timestamp: Date.now()
        };
        
        localStorage.setItem('evoCraftSave', JSON.stringify(gameState));
        
        // Feedback
        const saveBtn = document.getElementById('save-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✓ Gespeichert';
        saveBtn.style.background = 'var(--neon-green)';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
        }, 2000);
    }
    
    loadGameState() {
        const savedState = localStorage.getItem('evoCraftSave');
        if (savedState) {
            try {
                const gameState = JSON.parse(savedState);
                this.inventory = new Map(gameState.inventory || []);
                this.discoveredObjects = new Set(gameState.discoveredObjects || ['stone', 'wood']);
            } catch (error) {
                console.error('Failed to load game state:', error);
            }
        }
    }
    
    toggleSound() {
        const soundBtn = document.getElementById('sound-btn');
        const isMuted = soundBtn.textContent.includes('🔇');
        
        if (isMuted) {
            soundBtn.textContent = '🔊 Sound';
        } else {
            soundBtn.textContent = '🔇 Stumm';
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    updateUI() {
        this.updateInventoryDisplay();
        this.showAvailableObjects();
    }
}

// Game initialisieren
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new EvoCraftGame();
});
