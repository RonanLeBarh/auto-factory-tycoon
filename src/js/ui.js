// Gestion de l'interface : DOM, événements

import { state, calculateProduction, buyMachine, manualClick, activateOverclock, claimQuest, doPrestige, saveGame } from './game.js';
import { CONFIG } from './config.js';

export function renderShop() {
    const container = document.getElementById('shop-container');
    if (!container) return;
    container.innerHTML = '';
    
    CONFIG.machines.forEach(m => {
        const count = state.machines[m.id];
        const cost = getCost(m.id);
        const canBuy = state.pieces >= cost;
        let dataInfo = m.dataProd > 0 ? `<br><span style="color:var(--cyan)">+${m.dataProd} Données/s</span>` : "";
        
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="shop-header">
                <span>${m.name} <span class="count-badge">${count}</span></span>
                <span style="color:${canBuy?'var(--gold)':'#64748b'}">${cost} pts</span>
            </div>
            <div class="shop-desc">${m.desc} (+${m.baseProd} pts/s)${dataInfo}</div>
            <button class="btn btn-buy" style="${canBuy?'':'opacity:0.5'}" onclick="window.uiActions.buy('${m.id}')">
                ACHETER
            </button>
        `;
        container.appendChild(div);
    });
}

export function renderQuests() {
    const container = document.getElementById('quest-container');
    if (!container) return;
    container.innerHTML = '';
    
    state.quests.forEach(q => {
        let isDone = false;
        try {
            const evalStr = q.condition.replace(/machines\./g, 'state.machines.');
            isDone = eval(evalStr);
        } catch(e) {}
        
        const isClaimed = q.claimed;
        const div = document.createElement('div');
        div.className = `quest-item ${isClaimed ? 'quest-done' : ''}`;
        div.innerHTML = `
            <div>
                <div style="font-weight:bold; font-size:0.9em;">${q.name}</div>
                <div style="font-size:0.8em; color:#94a3b8;">${q.desc}</div>
            </div>
            <div>
                <span class="quest-reward">+${q.reward} Données</span>
                <button class="btn btn-claim" ${(!isDone || isClaimed) ? 'disabled' : ''} onclick="window.uiActions.claim('${q.id}')">
                    ${isClaimed ? 'FAIT' : 'REÇOIVRE'}
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

export function updateUI() {
    if (!document.getElementById('res-display')) return;

    document.getElementById('res-display').innerText = Math.floor(state.pieces).toLocaleString();
    document.getElementById('data-display').innerText = Math.floor(state.donnees).toLocaleString();
    
    // Calcul Base
    let baseProdP = calculateProduction('pieces');
    if (state.branch) {
        baseProdP *= CONFIG.branches[state.branch].mult;
        if (state.branch === 'magic') baseProdP *= CONFIG.branches.magic.passive;
    }
    baseProdP *= (1 + state.prestigeCount * CONFIG.game.prestigeMult);

    let baseProdD = calculateProduction('data');
    if (state.branch) {
        baseProdD *= CONFIG.branches[state.branch].mult;
        if (state.branch === 'magic') baseProdD *= CONFIG.branches.magic.passive;
    }
    baseProdD *= (1 + state.prestigeCount * CONFIG.game.prestigeMult);
    if (state.branch === 'social') baseProdD *= CONFIG.branches.social.dataBoost;

    // Calcul Réel
    let realProdP = baseProdP;
    let realProdD = baseProdD;

    // Header
    document.getElementById('bps-display').innerText = baseProdP.toFixed(1);
    document.getElementById('dps-display').innerText = baseProdD.toFixed(2);
    document.getElementById('prestige-display').innerText = "x" + (1 + state.prestigeCount * CONFIG.game.prestigeMult).toFixed(2);
    document.getElementById('prestige-bonus').innerText = "+" + Math.round(state.prestigeCount * CONFIG.game.prestigeMult * 100) + "%";
    document.getElementById('total-data').innerText = Math.floor(state.totalDataEarned).toLocaleString();

    // Click Power
    let clickPower = CONFIG.game.clickBase * (1 + state.prestigeCount * CONFIG.game.prestigeMult);
    if (state.overclockActive) {
        const tier = CONFIG.overclockTiers.find(t => t.id === state.overclockTier);
        if (tier) clickPower *= (1 + tier.bonus);
    }
    if (state.eventActive && state.eventConfig.type !== 'data') clickPower *= state.eventConfig.multiplier;
    document.getElementById('click-val').innerText = clickPower.toFixed(1);

    // Header Boost/Event
    const ocDisplay = document.getElementById('oc-display');
    if (state.overclockActive) {
        const tier = CONFIG.overclockTiers.find(t => t.id === state.overclockTier);
        if (tier) { ocDisplay.innerText = `NIVEAU ${tier.id} (+${tier.bonus*100}%)`; ocDisplay.classList.add('overclock-active'); ocDisplay.style.color = 'var(--cyan)'; }
    } else { ocDisplay.innerText = "AUCUN"; ocDisplay.classList.remove('overclock-active'); ocDisplay.style.color = 'var(--text)'; }

    const eventDisplay = document.getElementById('event-display');
    if (state.eventActive) {
        eventDisplay.innerText = state.eventConfig.name;
        eventDisplay.classList.add('event-active');
        eventDisplay.style.color = state.eventConfig.multiplier > 1 ? 'var(--green)' : 'var(--red)';
    } else { eventDisplay.innerText = "AUCUN"; eventDisplay.classList.remove('event-active'); eventDisplay.style.color = 'var(--text)'; }

    // Overclock Buttons
    CONFIG.overclockTiers.forEach(tier => {
        const btn = document.getElementById(`btn-oc-${tier.id}`);
        if (!btn) return;
        const isUnlocked = state.totalDataEarned >= tier.unlockData;
        if (!isUnlocked) {
            btn.disabled = true; btn.style.opacity = '0.3';
            btn.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${tier.name} (Verrouillé)</span><span>${tier.cost} Données</span></div><small>Besoin: ${tier.unlockData} Données cumulées</small>`;
        } else if (state.overclockActive) {
            btn.disabled = true; btn.style.opacity = '0.5';
            btn.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${tier.name} (En cours)</span><span>...</span></div><small>Attendez la fin</small>`;
        } else if (state.donnees < tier.cost) {
            btn.disabled = true; btn.style.opacity = '0.5';
            btn.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${tier.name}</span><span>MANQUE (${tier.cost - state.donnees})</span></div><small>${tier.duration}s</small>`;
        } else {
            btn.disabled = false; btn.style.opacity = '1';
            btn.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${tier.name} (+${tier.bonus*100}%)</span><span>${tier.cost} Données</span></div><small>${tier.duration}s</small>`;
        }
    });

    // Shop Buttons Update
    CONFIG.machines.forEach(m => {
        const btn = document.querySelector(`button[onclick="window.uiActions.buy('${m.id}')"]`);
        if (btn) {
            const cost = getCost(m.id);
            if (state.pieces >= cost) { btn.disabled = false; btn.style.opacity = '1'; }
            else { btn.disabled = true; btn.style.opacity = '0.5'; }
        }
    });

    // Event Timer
    if (state.eventActive) {
        document.getElementById('event-timer').style.display = 'block';
        document.getElementById('event-countdown').innerText = state.eventTimer;
        document.getElementById('event-desc').innerText = state.eventConfig.desc;
    } else {
        document.getElementById('event-timer').style.display = 'none';
        document.getElementById('event-desc').innerText = "En attente d'un événement...";
    }

    // Prestige Button
    const btnPrestige = document.querySelector('.btn-reset');
    if (baseProdP >= CONFIG.game.prestigeReq && !state.overclockActive && !state.eventActive) {
        btnPrestige.disabled = false; btnPrestige.style.opacity = 1; btnPrestige.title = "Reborn disponible";
    } else {
        btnPrestige.disabled = true; btnPrestige.style.opacity = 0.5;
        if (state.overclockActive) btnPrestige.title = "Attendez la fin de l'Overclock";
        else if (state.eventActive) btnPrestige.title = "Attendez la fin de l'Événement";
        else btnPrestige.title = `Besoin de ${CONFIG.game.prestigeReq}/s (Base: ${baseProdP.toFixed(1)})`;
    }

    // Stats
    let totalMachines = Object.values(state.machines).reduce((a,b)=>a+b, 0);
    document.getElementById('machine-count').innerText = totalMachines;
    document.getElementById('branch-info').innerText = state.branch ? CONFIG.branches[state.branch].name : "-";
    document.getElementById('real-bps').innerText = realProdP.toFixed(1) + "/s";
    document.getElementById('real-dps').innerText = realProdD.toFixed(2) + "/s";
    
    if (state.overclockActive) {
        const tier = CONFIG.overclockTiers.find(t => t.id === state.overclockTier);
        document.getElementById('oc-percent').innerText = "+" + Math.round(tier.bonus * 100);
        document.getElementById('oc-countdown').innerText = state.overclockTimer;
        document.getElementById('oc-timer').style.display = 'block';
    } else { 
        document.getElementById('oc-percent').innerText = "0";
        document.getElementById('oc-timer').style.display = 'none';
    }
}

// Helper global pour les onclicks HTML
window.uiActions = {
    buy: (id) => { if(buyMachine(id)) { renderShop(); updateUI(); saveGame(); } },
    claim: (id) => { if(claimQuest(id)) { renderQuests(); updateUI(); saveGame(); } }
};

function getCost(id) {
    const m = CONFIG.machines.find(x => x.id === id);
    const count = state.machines[id];
    return Math.floor(m.baseCost * Math.pow(1.15, count));
}