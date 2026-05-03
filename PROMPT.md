# Prompt de Régénération du Projet

## Rôle
Agis en tant qu'expert développeur Front-End spécialisé dans les jeux Idle. Ta tâche est de recréer le jeu "Auto-Factory Tycoon" version 5.

## Spécifications Techniques
- **Stack** : HTML5, CSS3, JavaScript (ES6+ Modules).
- **Architecture** : Data-Driven (toutes les valeurs dans un fichier de config JSON-like).
- **Structure** :
  - `index.html` (léger, import des modules).
  - `src/css/style.css` (design Cyberpunk/Sci-Fi, responsive).
  - `src/js/config.js` (constantes : machines, branches, overclock, quests, events).
  - `src/js/game.js` (logique : boucle, calculs, actions, sauvegarde localStorage).
  - `src/js/ui.js` (DOM : mise à jour des compteurs, boutons, quêtes, shop).
  - `src/js/main.js` (initialisation).
- **Fonctionnalités** :
  - 3 Branches (Logique, Magie, Sociale).
  - 4 Niveaux d'Overclock (bonus progressifs, coûts élevés).
  - Système de Quêtes (conditions dynamiques, récompenses).
  - Événements aléatoires (Tempête, Boom, Glitch).
  - Système de Prestige (Reborn) avec calcul de production de base (sans boosts).
  - Séparation visuelle : Header (Production Base) vs Stats (Production Réelle avec boosts).
  - Boutons réactifs (grisés si ressources insuffisantes).

## Instructions de Génération
1. Génère d'abord la structure de fichiers.
2. Crée `config.js` avec des valeurs équilibrées (bonus réduits : +30%, +50%, +100%, +150%).
3. Implémente `game.js` avec la logique de boucle et de sauvegarde.
4. Implémente `ui.js` avec la séparation Base/Réel et la gestion des événements.
5. Crée `index.html` et `style.css` pour un design moderne et responsive.
6. Assure-toi que le code est modulaire (import/export).

## Contraintes
- Pas de framework (React/Vue).
- Zéro valeur hardcodée dans la logique.
- Code commenté et propre.
- Compatible avec GitHub Pages.