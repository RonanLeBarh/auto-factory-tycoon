// Logique de jeu : calculs, boucles

import { CONFIG } from './config.js';

// État global du jeu
export let state = {
    pieces: 0,
    donnees: 0,
    totalDataEarned: 0,
    branch: null,
    machines: {}, 
    prestigeCount: 0,
    overclockActive: false,
    overclockTier: 0,
    overclockTimer: 0,
    eventActive: false,
    eventTimer: 0,
    eventConfig: null,
    nextEventTime: 0,
    quests: [],
    startTime: Date.now()
};

// Initialisation des machines
CONFIG.machines.forEach(m => { if(!state.machines[m.id]) state.machines[m.id] = 0; });
if (state.quests.length === 0) {
    state.quests = JSON.parse(JSON.stringify(CONFIG.quests));
}

// Boucles
export let timer = null;
export let ocTimer = null;
export let eventTimer = null;

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
    if (state.eventActive && state.eventConfig.type !== 'data') {
        power *= state.eventConfig.multiplier;
    }
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

export function selectBranch(type) {
    state.branch = type;
}

export function saveGame() {
    localStorage.setItem('autoFactoryV5', JSON.stringify(state));
}

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