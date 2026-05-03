export const CONFIG = {
    game: { startRes: 0, clickBase: 1, prestigeReq: 10000, prestigeMult: 0.10, eventCheckInterval: 10, eventMinTime: 30, eventMaxTime: 120 },
    branches: { logic: { name: "Logique", color: "#3b82f6", mult: 2.5, risk: 0.15 }, magic: { name: "Magie", color: "#a855f7", mult: 0.5, passive: 3.0 }, social: { name: "Social", color: "#22c55e", mult: 1.2, dataBoost: 2.0 } },
    overclockTiers: [
        { id: 1, name: "Niveau 1", bonus: 0.30, duration: 60, cost: 50, unlockData: 0 },
        { id: 2, name: "Niveau 2", bonus: 0.50, duration: 90, cost: 200, unlockData: 500 },
        { id: 3, name: "Niveau 3", bonus: 1.00, duration: 120, cost: 1000, unlockData: 2000 },
        { id: 4, name: "Niveau 4", bonus: 1.50, duration: 180, cost: 5000, unlockData: 10000 }
    ],
    machines: [
        { id: 'hand', name: "Main d'œuvre", baseCost: 15, baseProd: 0.5, dataProd: 0, desc: "Ouvrier basique." },
        { id: 'drill', name: "Foreuse Auto", baseCost: 100, baseProd: 3, dataProd: 0, desc: "Produit des pièces." },
        { id: 'arm', name: "Bras Robotique", baseCost: 1100, baseProd: 12, dataProd: 0, desc: "Assemble des modules." },
        { id: 'server', name: "Serveur de Données", baseCost: 12000, baseProd: 45, dataProd: 0.5, desc: "Commence à générer des Données." },
        { id: 'ai', name: "IA Centrale", baseCost: 130000, baseProd: 150, dataProd: 2.0, desc: "Gère la production et les Données." },
        { id: 'quantum', name: "Réacteur Quantique", baseCost: 1300000, baseProd: 600, dataProd: 10.0, desc: "Production massive de Données." }
    ],
    quests: [
        { id: 'q1', name: "Premiers pas", desc: "Achat de 5 Main d'œuvre", condition: "machines.hand >= 5", reward: 50, claimed: false },
        { id: 'q2', name: "Automatisation", desc: "Achat de 10 Foreuses", condition: "machines.drill >= 10", reward: 100, claimed: false },
        { id: 'q3', name: "Data Center", desc: "Achat de 5 Serveurs", condition: "machines.server >= 5", reward: 250, claimed: false },
        { id: 'q4', name: "Intelligence", desc: "Achat de 2 IA Centrales", condition: "machines.ai >= 2", reward: 500, claimed: false },
        { id: 'q5', name: "Quantique", desc: "Achat de 1 Réacteur", condition: "machines.quantum >= 1", reward: 1000, claimed: false }
    ],
    events: [
        { id: 'storm', name: "Tempête de Données", desc: "Production de Données x2 pendant 30s", multiplier: 2.0, duration: 30, type: 'data' },
        { id: 'boom', name: "Boom Économique", desc: "Production de Pièces x2 pendant 30s", multiplier: 2.0, duration: 30, type: 'pieces' },
        { id: 'glitch', name: "Glitch Système", desc: "Production x0.5 pendant 15s (Pénalité)", multiplier: 0.5, duration: 15, type: 'all' }
    ]
};