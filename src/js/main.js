// Point d'entrée qui initialise tout

import { state, timer, ocTimer, eventTimer, loadGame, saveGame, selectBranch, gameLoop, scheduleNextEvent, triggerRandomEvent, startOcTimer, startEventTimer, deactivateOverclock, deactivateEvent } from './game.js';
import { updateUI, renderShop, renderQuests } from './ui.js';
import { CONFIG } from './config.js';

// Redéfinir les exports nécessaires pour main.js si besoin, ou importer directement
// Pour simplifier, on réinitialise les timers ici
let timerRef = null;
let ocTimerRef = null;
let eventTimerRef = null;

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

    timerRef = setInterval(gameLoop, 1000);
    setInterval(updateUI, 100);
    
    if (state.overclockActive) {
        startOcTimer(state.overclockTimer);
    }
    if (state.eventActive) {
        startEventTimer(state.eventTimer);
    }
}

export function updateBranchBadge() {
    const badge = document.getElementById('branch-badge');
    if (state.branch) {
        badge.innerText = CONFIG.branches[state.branch].name;
        badge.style.background = CONFIG.branches[state.branch].color;
        badge.style.color = '#fff';
    }
}

// Fonctions globales pour les boutons HTML
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
        startOcTimer(tier.duration);
        showOcModal(tier);
        updateUI();
        saveGame();
        log(`OVERCLOCK Niveau ${id} ACTIVÉ !`);
    }
};

window.doPrestige = () => {
    if (doPrestige()) {
        saveGame();
        clearInterval(timerRef);
        if (ocTimerRef) clearInterval(ocTimerRef);
        if (eventTimerRef) clearInterval(eventTimerRef);
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
    document.getElementById('oc-status').innerText = `NIVEAU ${tier.id}`;
    document.getElementById('oc-status').classList.add('overclock-active');
}

function log(msg) {
    const area = document.getElementById('game-log');
    if(area) area.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}<br>` + area.innerHTML;
}

// Import des fonctions de game.js qui étaient exportées mais pas utilisées dans ui.js
// On les ré-exporte ici pour que main.js puisse les appeler
import { gameLoop, scheduleNextEvent, triggerRandomEvent, startOcTimer, startEventTimer, deactivateOverclock, deactivateEvent, manualClick } from './game.js';

// Redéfinition des timers globaux pour main.js
// Note: Dans une vraie app, on gérerait mieux les imports cycliques.
// Ici, on assume que game.js a les fonctions et on les appelle.
// Pour que cela fonctionne, il faut que game.js exporte les fonctions de timer.
// J'ai ajouté les exports dans game.js plus haut.

// Initialisation
init();