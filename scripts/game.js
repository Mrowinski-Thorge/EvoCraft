// Game JavaScript
class EvoCraftGame {
    constructor() {
        this.elements = new Map();
        this.inventory = [];
        this.discoveredItems = new Set();
        this.currentEpoch = 'primordial';
        this.gameData = {
            combinations: {
                'fire+water': { result: 'steam', icon: '💨', name: 'Dampf' },
                'fire+earth': { result: 'lava', icon: '🌋', name: 'Lava' },
                'water+earth': { result: 'mud', icon: '🌫️', name: 'Schlamm' },
                'air+water': { result: 'cloud', icon: '☁️', name: 'Wolke' },
                'fire+air': { result: 'energy', icon: '⚡', name: 'Energie' },
                'earth+air': { result: 'dust', icon: '🌪️', name: 'Staub' }
            },
            elements: {
                fire: { icon: '🔥', name: 'Feuer' },
                water: { icon: '💧', name: 'Wasser' },
                earth: { icon: '🌍', name: 'Erde' },
                air: { icon: '💨', name: 'Luft' }
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadGameState();
        this.updateUI();
    }
    
    setupEventListeners() {
        // Drag & Drop für Elemente
        this.setupDragAndDrop();
        
        // Kombinieren Button
        const combineBtn = document.getElementById('combine-btn');
        combineBtn.addEventListener('click', () => this.combineElements());
        
        // Control Buttons
        document.getElementById('save-btn').addEventListener('click', () => this.saveGame());
        document.getElementById('sound-btn').addEventListener('click', () => this.toggleSound());
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // Epochen Selector
        document.getElementById('epoch-select').addEventListener('change', (e) => {
            this.changeEpoch(e.target.value);
        });
    }
    
    setupDragAndDrop() {
        const elements = document.querySelectorAll('.element');
        const dropZones = document.querySelectorAll('.drop-zone');
        
        elements.forEach(element => {
            element.draggable = true;
            element.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.element);
                e.target.style.opacity = '0.5';
            });
            
            element.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });
        });
        
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
                const elementType = e.dataTransfer.getData('text/plain');
                this.placeElement(zone, elementType);
                zone.classList.remove('drag-over');
            });
        });
    }
    
    placeElement(zone, elementType) {
        const elementData = this.gameData.elements[elementType];
        if (!elementData) return;
        
        zone.innerHTML = `
            <div class="placed-element" data-element="${elementType}">
                <span class="element-icon">${elementData.icon}</span>
                <span class="element-name">${elementData.name}</span>
                <button class="remove-element" onclick="game.removeElement('${zone.id}')">×</button>
            </div>
        `;
        zone.classList.add('filled');
        zone.dataset.element = elementType;
        
        this.checkCombination();
    }
    
    removeElement(zoneId) {
        const zone = document.getElementById(zoneId);
        zone.innerHTML = '<span class="drop-hint">Element hier ablegen</span>';
        zone.classList.remove('filled');
        delete zone.dataset.element;
        
        this.checkCombination();
    }
    
    checkCombination() {
        const zone1 = document.getElementById('drop-zone-1');
        const zone2 = document.getElementById('drop-zone-2');
        const combineBtn = document.getElementById('combine-btn');
        
        if (zone1.dataset.element && zone2.dataset.element) {
            combineBtn.disabled = false;
        } else {
            combineBtn.disabled = true;
        }
    }
    
    combineElements() {
        const zone1 = document.getElementById('drop-zone-1');
        const zone2 = document.getElementById('drop-zone-2');
        const resultArea = document.getElementById('result-area');
        
        const element1 = zone1.dataset.element;
        const element2 = zone2.dataset.element;
        
        if (!element1 || !element2) return;
        
        // Kombinationsschlüssel erstellen (alphabetisch sortiert für Konsistenz)
        const combinationKey = [element1, element2].sort().join('+');
        const combination = this.gameData.combinations[combinationKey];
        
        if (combination) {
            // Erfolgreiche Kombination
            this.showResult(combination, resultArea);
            this.addToInventory(combination);
            this.updateDiscovery(combination);
            
            // Animation
            resultArea.style.animation = 'none';
            setTimeout(() => {
                resultArea.style.animation = 'pulse 0.5s ease-out';
            }, 10);
        } else {
            // Fehlgeschlagene Kombination
            this.showFailure(resultArea);
        }
        
        // Zones zurücksetzen
        setTimeout(() => {
            this.removeElement('drop-zone-1');
            this.removeElement('drop-zone-2');
        }, 1500);
    }
    
    showResult(combination, resultArea) {
        resultArea.innerHTML = `
            <div class="result-success">
                <span class="result-icon">${combination.icon}</span>
                <span class="result-name">${combination.name}</span>
                <span class="result-new">Neu!</span>
            </div>
        `;
    }
    
    showFailure(resultArea) {
        resultArea.innerHTML = `
            <div class="result-failure">
                <span class="result-icon">❌</span>
                <span class="result-name">Keine Reaktion</span>
            </div>
        `;
        
        setTimeout(() => {
            resultArea.innerHTML = '<div class="result-placeholder"><span>Ergebnis erscheint hier</span></div>';
        }, 2000);
    }
    
    addToInventory(item) {
        this.inventory.push(item);
        this.discoveredItems.add(item.result);
        this.updateInventoryDisplay();
        this.updateProgress();
    }
    
    updateInventoryDisplay() {
        const inventoryGrid = document.getElementById('inventory');
        const slots = inventoryGrid.querySelectorAll('.inventory-slot');
        
        slots.forEach((slot, index) => {
            if (this.inventory[index]) {
                const item = this.inventory[index];
                slot.innerHTML = `
                    <span class="item-icon">${item.icon}</span>
                    <span class="item-name">${item.name}</span>
                `;
                slot.classList.add('filled');
                slot.classList.remove('empty');
            } else {
                slot.innerHTML = '<span>Leer</span>';
                slot.classList.remove('filled');
                slot.classList.add('empty');
            }
        });
    }
    
    updateDiscovery(item) {
        const lastDiscovery = document.getElementById('last-discovery');
        lastDiscovery.innerHTML = `
            <div class="discovery-item">
                <span class="discovery-icon">${item.icon}</span>
                <span class="discovery-name">${item.name}</span>
            </div>
        `;
    }
    
    updateProgress() {
        const totalItems = Object.keys(this.gameData.combinations).length;
        const discovered = this.discoveredItems.size;
        const percentage = (discovered / totalItems) * 100;
        
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${discovered} von ${totalItems} Items entdeckt`;
        
        // Epochen freischalten basierend auf Fortschritt
        this.checkEpochUnlock(percentage);
    }
    
    checkEpochUnlock(percentage) {
        const epochSelect = document.getElementById('epoch-select');
        const options = epochSelect.querySelectorAll('option');
        
        options.forEach(option => {
            const value = option.value;
            let unlocked = false;
            
            switch(value) {
                case 'primordial':
                    unlocked = true;
                    break;
                case 'stone':
                    unlocked = percentage >= 25;
                    break;
                case 'bronze':
                    unlocked = percentage >= 50;
                    break;
                case 'iron':
                    unlocked = percentage >= 75;
                    break;
            }
            
            if (unlocked) {
                option.textContent = option.textContent.replace(' (🔒)', '');
                option.disabled = false;
            }
        });
    }
    
    changeEpoch(epoch) {
        this.currentEpoch = epoch;
        // Hier würden epochenspezifische Elemente geladen werden
        console.log('Epoche gewechselt zu:', epoch);
    }
    
    saveGame() {
        const gameState = {
            inventory: this.inventory,
            discoveredItems: Array.from(this.discoveredItems),
            currentEpoch: this.currentEpoch
        };
        
        localStorage.setItem('evoCraftSave', JSON.stringify(gameState));
        
        // Feedback für den Nutzer
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
            const gameState = JSON.parse(savedState);
            this.inventory = gameState.inventory || [];
            this.discoveredItems = new Set(gameState.discoveredItems || []);
            this.currentEpoch = gameState.currentEpoch || 'primordial';
        }
    }
    
    toggleSound() {
        // Sound Toggle Logik
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
        this.updateProgress();
    }
}

// CSS für Game-spezifische Animationen
const gameAnimationStyles = `
    .placed-element {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: white;
        position: relative;
        padding: 8px;
    }
    
    .element-icon {
        font-size: 2rem;
    }
    
    .element-name {
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .remove-element {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ef4444;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .result-success {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: white;
        animation: celebration 0.5s ease-out;
    }
    
    .result-failure {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #ef4444;
    }
    
    .result-icon {
        font-size: 3rem;
    }
    
    .result-name {
        font-size: 1rem;
        font-weight: 600;
    }
    
    .result-new {
        background: var(--neon-green);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 600;
    }
    
    @keyframes celebration {
        0% { transform: scale(0.5
