# Documentation Technique - Auto-Factory Tycoon

## Architecture
Le projet utilise une architecture **Data-Driven** (pilotée par les données). Toute la logique de jeu (valeurs, coûts, probabilités) est centralisée dans `src/js/config.js`. Le code de logique (`game.js`) et d'interface (`ui.js`) ne contient aucune valeur "hardcodée".

## Structure des Fichiers

### `src/js/config.js`
Contient toutes les constantes du jeu :
- `CONFIG.game` : Paramètres globaux (coûts, durées, seuils).
- `CONFIG.branches` : Définition des 3 branches (Logique, Magie, Sociale).
- `CONFIG.overclockTiers` : Définition des 4 niveaux de boost.
- `CONFIG.machines` : Liste des machines, coûts de base, production.
- `CONFIG.quests` : Liste des quêtes et conditions.
- `CONFIG.events` : Types d'événements aléatoires.

### `src/js/game.js`
Contient la logique métier pure :
- `state` : Objet global représentant l'état du jeu (ressources, machines, etc.).
- `calculateProduction()` : Calcule la production de base et réelle.
- `buyMachine()`, `activateOverclock()`, `claimQuest()` : Actions du joueur.
- `gameLoop()` : Boucle principale exécutée chaque seconde.
- `saveGame()`, `loadGame()` : Gestion de la persistance (localStorage).

### `src/js/ui.js`
Gère l'interaction avec le DOM :
- `updateUI()` : Met à jour tous les éléments affichés (ressources, boutons, quêtes).
- `renderShop()`, `renderQuests()` : Génère dynamiquement les listes.
- Gestion des événements (clics, soumissions).
- Séparation stricte entre **Production de Base** (Header) et **Production Réelle** (Stats).

### `src/js/main.js`
Point d'entrée :
- Importe les modules.
- Initialise le jeu (`init()`).
- Gère le chargement initial et la liaison des événements.

### `src/css/style.css`
Contient tout le style CSS, y compris les variables CSS (`:root`) pour les couleurs et les thèmes.

## Flux de Données
1. **Initialisation** : `main.js` charge `config.js` et `state` depuis `localStorage` (ou défaut).
2. **Boucle** : `gameLoop()` (dans `game.js`) calcule les nouvelles ressources.
3. **Mise à jour** : `updateUI()` (dans `ui.js`) lit `state` et met à jour le DOM.
4. **Action** : L'utilisateur clique -> `ui.js` appelle `game.js` -> `game.js` modifie `state` -> `ui.js` met à jour l'affichage.

## Sécurité & Limitations
- **Client-Side Only** : Toutes les données sont stockées localement (`localStorage`).
- **Triche Possible** : Un utilisateur peut modifier les valeurs dans la console.
- **Future Évolution** : Prévu pour intégrer Firebase/Supabase pour une sauvegarde cloud et une validation serveur.

## Commandes Git
- `git status` : Voir les modifications.
- `git add .` : Ajouter tous les fichiers.
- `git commit -m "message"` : Valider les changements.
- `git push` : Envoyer vers GitHub.