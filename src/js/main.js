import { state, loadGame, saveGame, selectBranch, manualClick, activateOverclock, doPrestige, gameLoop, scheduleNextEvent, triggerRandomEvent, startTimers, stopTimers, deactivateOverclock, deactivateEvent } from './game.js';
import { updateUI, renderShop, renderQuests } from './ui.js';
import { CONFIG } from './config.js';

export function init() {
    loadGame();
    renderShop();
    renderQuests();
    updateUI();
    
    if (!state.branch) {
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
    } else {
        startGame();
    }
}

export function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    updateBranchBadge();
    
    if (!state.nextEventTime || state.nextEventTime < Date.now()) {
        scheduleNextEvent();
    }
    
    startTimers();
    // UI update rapide
    setInterval(updateUI, 100);
}

export function updateBranchBadge() {
    const badge = document.getElementById('branch-badge');
    if (state.branch) {
        badge.innerText = CONFIG.branches[state.branch].name;
        badge.style.background = CONFIG.branches[state.branch].color;
        badge.style.color = '#fff';
    }
}

window.selectBranch = (type) => {
    selectBranch(type);
    saveGame();
    startGame();
    log(`Branche activée : ${CONFIG.branches[type].name}`);
};

window.manualClick = () => {
    manualClick();
    updateUI();
    saveGame();
};

window.activateOverclock = (id) => {
    if (activateOverclock(id)) {
        const tier = CONFIG.overclockTiers.find(t => t.id === id);
        // Le timer est géré par startTimers() qui est appelé dans startGame(), 
        // mais ici on doit s'assurer que le timer OC est lancé si ce n'est pas déjà fait.
        // Pour simplifier, on relance startTimers qui détectera l'état actif.
        startTimers(); 
        showOcModal(tier);
        updateUI();
        saveGame();
        log(`OVERCLOCK Niveau ${id} ACTIVÉ !`);
    }
};

window.doPrestige = () => {
    if (doPrestige()) {
        saveGame();
        stopTimers();
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        updateUI();
        renderShop();
        renderQuests();
        log("REBOND EFFECTUÉ !");
    }
};

window.closeOcModal = () => {
    document.getElementById('oc-modal').classList.add('hidden');
    document.getElementById('oc-modal').style.display = 'none';
};

function showOcModal(tier) {
    document.getElementById('oc-modal').classList.remove('hidden');
    document.getElementById('oc-modal').style.display = 'flex';
    document.getElementById('oc-title').innerText = `OVERCLOCK NIVEAU ${tier.id} !`;
    document.getElementById('oc-desc').innerHTML = `Bonus: +${tier.bonus*100}%<br>Duration: ${tier.duration}s`;
}

function log(msg) {
    const area = document.getElementById('game-log');
    if(area) area.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}<br>` + area.innerHTML;
}

init();