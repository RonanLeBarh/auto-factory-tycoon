import { CONFIG } from './config.js';

export let state = {
    pieces: 0, donnees: 0, totalDataEarned: 0, branch: null, machines: {}, prestigeCount: 0,
    overclockActive: false, overclockTier: 0, overclockTimer: 0,
    eventActive: false, eventTimer: 0, eventConfig: null, nextEventTime: 0, quests: [], startTime: Date.now()
};

CONFIG.machines.forEach(m => { if(!state.machines[m.id]) state.machines[m.id] = 0; });
if (state.quests.length === 0) state.quests = JSON.parse(JSON.stringify(CONFIG.quests));

// Timers locaux
let gameLoopId = null;
let ocLoopId = null;
let eventLoopId = null;

export function startTimers() {
    if (gameLoopId) clearInterval(gameLoopId);
    gameLoopId = setInterval(gameLoop, 1000);
    
    // Gestion Overclock
    if (state.overclockActive) {
        if (ocLoopId) clearInterval(ocLoopId);
        ocLoopId = setInterval(() => {
            state.overclockTimer--;
            
            // --- CORRECTION : Mise à jour de l'UI du minuteur ---
            const countdownEl = document.getElementById('oc-countdown');
            const timerBox = document.getElementById('oc-timer');
            const percentEl = document.getElementById('oc-percent');
            
            if (countdownEl) countdownEl.innerText = state.overclockTimer;
            if (timerBox) timerBox.style.display = 'block'; // Assure que la boîte est visible
            
            // Mise à jour du pourcentage affiché dans le timer
            if (percentEl && state.overclockTier) {
                const tier = CONFIG.overclockTiers.find(t => t.id === state.overclockTier);
                if (tier) percentEl.innerText = "+" + Math.round(tier.bonus * 100);
            }
            // -----------------------------------------------

            if (state.overclockTimer <= 0) deactivateOverclock();
        }, 1000);
    } else {
        // Si pas actif, on cache la boîte du timer
        const timerBox = document.getElementById('oc-timer');
        if (timerBox) timerBox.style.display = 'none';
    }

    // Gestion Event
    if (state.eventActive) {
        if (eventLoopId) clearInterval(eventLoopId);
        eventLoopId = setInterval(() => {
            state.eventTimer--;
            // MISE À JOUR DE L'AFFICHAGE HTML (Manquant avant)
            const eventCountdownEl = document.getElementById('event-countdown');
            const eventTimerBox = document.getElementById('event-timer');
            if (eventCountdownEl) eventCountdownEl.innerText = state.eventTimer;
            if (eventTimerBox) eventTimerBox.style.display = 'block';

            if (state.eventTimer <= 0) deactivateEvent();
        }, 1000);
    } else {
        const eventTimerBox = document.getElementById('event-timer');
        if (eventTimerBox) eventTimerBox.style.display = 'none';
    }
}

export function stopTimers() {
    if (gameLoopId) clearInterval(gameLoopId);
    if (ocLoopId) clearInterval(ocLoopId);
    if (eventLoopId) clearInterval(eventLoopId);
}

export function calculateProduction(type) {
    let total = 0;
    CONFIG.machines.forEach(m => {
        let amount = state.machines[m.id] || 0;
        if (type === 'pieces') total += amount * m.baseProd;
        if (type === 'data') total += amount * m.dataProd;
    });
    return total;
}

export function getCost(machineId) {
    const m = CONFIG.machines.find(x => x.id === machineId);
    const count = state.machines[machineId];
    return Math.floor(m.baseCost * Math.pow(1.15, count));
}

export function buyMachine(id) {
    const cost = getCost(id);
    if (state.pieces >= cost) {
        state.pieces -= cost;
        state.machines[id]++;
        return true;
    }
    return false;
}

export function manualClick() {
    let power = CONFIG.game.clickBase * (1 + (state.prestigeCount * CONFIG.game.prestigeMult));
    if (state.overclockActive) {
        const tier = CONFIG.overclockTiers.find(t => t.id === state.overclockTier);
        if (tier) power *= (1 + tier.bonus);
    }
    if (state.eventActive && state.eventConfig.type !== 'data') power *= state.eventConfig.multiplier;
    state.pieces += power;
}

export function activateOverclock(tierId) {
    if (state.overclockActive) return false;
    const tier = CONFIG.overclockTiers.find(t => t.id === tierId);
    if (!tier || state.donnees < tier.cost) return false;
    state.donnees -= tier.cost;
    state.overclockActive = true;
    state.overclockTier = tierId;
    state.overclockTimer = tier.duration;
    return true;
}

export function claimQuest(questId) {
    const q = state.quests.find(x => x.id === questId);
    if (!q || q.claimed) return false;
    try {
        const evalStr = q.condition.replace(/machines\./g, 'state.machines.');
        if (eval(evalStr)) {
            state.donnees += q.reward;
            q.claimed = true;
            return true;
        }
    } catch (e) {}
    return false;
}

export function doPrestige() {
    let prodP = calculateProduction('pieces');
    if (state.branch) {
        prodP *= CONFIG.branches[state.branch].mult;
        if (state.branch === 'magic') prodP *= CONFIG.branches.magic.passive;
    }
    prodP *= (1 + (state.prestigeCount * CONFIG.game.prestigeMult));
    
    if (prodP < CONFIG.game.prestigeReq) return false;

    // --- CORRECTION : Ajout de la confirmation ---
    if (!confirm("REBORN CONFIRMÉ ?\n- Vous perdez tout (Pièces, Données, Machines, Quêtes).\n- Vous gardez le bonus de prestige.\n- Vous pouvez choisir une NOUVELLE branche.")) {
        return false; // Annule l'opération si l'utilisateur clique sur "Annuler"
    }
    // ---------------------------------------------

    state.pieces = 0; 
    state.donnees = 0; 
    state.totalDataEarned = 0;
    CONFIG.machines.forEach(m => state.machines[m.id] = 0);
    state.quests = JSON.parse(JSON.stringify(CONFIG.quests));
    state.overclockActive = false; 
    state.overclockTier = 0; 
    state.overclockTimer = 0;
    state.eventActive = false; 
    state.eventTimer = 0; 
    state.eventConfig = null;
    state.prestigeCount++; 
    state.branch = null;
    return true;
}

export function selectBranch(type) { state.branch = type; }

export function saveGame() { localStorage.setItem('autoFactoryV5', JSON.stringify(state)); }

export function loadGame() {
    const s = localStorage.getItem('autoFactoryV5');
    if (s) {
        try {
            const loaded = JSON.parse(s);
            state = { ...state, ...loaded };
            CONFIG.machines.forEach(m => { if(typeof state.machines[m.id] === 'undefined') state.machines[m.id] = 0; });
            if (state.quests.length === 0) state.quests = JSON.parse(JSON.stringify(CONFIG.quests));
        } catch(e) { console.error("Erreur chargement", e); }
    }
}

export function gameLoop() {
    if (!state.branch) return;
    if (!state.eventActive && Date.now() >= state.nextEventTime) {
        triggerRandomEvent();
        scheduleNextEvent();
    }
    let branchCfg = CONFIG.branches[state.branch];
    let rawPieces = calculateProduction('pieces');
    let finalPieces = rawPieces * branchCfg.mult;
    if (state.branch === 'magic') finalPieces *= branchCfg.passive;
    finalPieces *= (1 + (state.prestigeCount * CONFIG.game.prestigeMult));
    if (state.overclockActive) {
        const tier = CONFIG.overclockTiers.find(t => t.id === state.overclockTier);
        if (tier) finalPieces *= (1 + tier.bonus);
    }
    if (state.eventActive && state.eventConfig.type !== 'data') finalPieces *= state.eventConfig.multiplier;
    if (state.branch === 'logic' && Math.random() < branchCfg.risk) finalPieces = 0;
    state.pieces += finalPieces;

    let rawData = calculateProduction('data');
    let finalData = rawData * branchCfg.mult;
    if (state.branch === 'magic') finalData *= branchCfg.passive;
    finalData *= (1 + (state.prestigeCount * CONFIG.game.prestigeMult));
    if (state.overclockActive) {
        const tier = CONFIG.overclockTiers.find(t => t.id === state.overclockTier);
        if (tier) finalData *= (1 + tier.bonus);
    }
    if (state.eventActive && state.eventConfig.type !== 'pieces') finalData *= state.eventConfig.multiplier;
    if (state.branch === 'social') finalData *= branchCfg.dataBoost;
    state.donnees += finalData;
    state.totalDataEarned += finalData;
}

export function scheduleNextEvent() {
    const delay = Math.floor(Math.random() * (CONFIG.game.eventMaxTime - CONFIG.game.eventMinTime) + CONFIG.game.eventMinTime) * 1000;
    state.nextEventTime = Date.now() + delay;
}

export function triggerRandomEvent() {
    if (state.eventActive) return;
    const event = CONFIG.events[Math.floor(Math.random() * CONFIG.events.length)];
    state.eventActive = true;
    state.eventConfig = event;
    state.eventTimer = event.duration;
}

export function deactivateOverclock() {
    state.overclockActive = false; state.overclockTier = 0; state.overclockTimer = 0;
    if (ocLoopId) clearInterval(ocLoopId);
}

export function deactivateEvent() {
    state.eventActive = false; state.eventTimer = 0; state.eventConfig = null;
    if (eventLoopId) clearInterval(eventLoopId);
}