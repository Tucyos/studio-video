---
name: controle-qualite
description: Vérifier à froid une plage ou toute une vidéo du studio (un agent qui n'a pas construit la section) — contrôles automatiques, puis ce que seuls les yeux voient sur les images rendues (texte coupé, objet au bord, lisibilité, DA). Sortie JSON des problèmes, graves d'abord. À utiliser avant un export, après une construction, ou pour comparer deux versions.
metadata:
  source: "premier jet DeepSeek (22/10) relu et corrigé par Claude, d'après CLAUDE.md (phase 2)"
---

# Vérifier une vidéo

## 1. Ton rôle

Tu n'as pas construit cette section : tu la juges **à froid**.
- Tu ne répares rien et tu ne touches pas au code. Tu constates, tu situes (instant, plan), tu décris.
- Deux sources : le rapport des contrôles automatiques et les images PNG que tu regardes toi-même. L'une ne remplace pas l'autre : un contrôle muet ne prouve pas que l'image est bonne.

## 2. Les seules commandes

```
node .studio/rendre.mjs 12.5 30 31.2      # images aux instants donnés (en secondes) -> qa/snaps/t12.500.png …
node .studio/controler.mjs 30 43          # contrôles sur la plage 30 s -> 43 s ; affiche le chemin du rapport JSON
```
Regarde les PNG avec Read. Ouvre le rapport au chemin affiché.

## 3. Les contrôles automatiques

Le rapport : `{t, t1, plan, controle, cible, probleme, gravite, source}`, graves d'abord. Il est accompagné de `qa/problemes.png` (jusqu'à 20 images signalées, calques rouges) : elle sert à retrouver vite l'image à regarder, pas à juger à ta place.

- **À-coups** : la caméra ou un sujet saute d'une image à l'autre (trajectoire du projet quand elle existe, sinon caméra et sujets relevés).
- **Zone sûre** (mesurée sur l'iPhone de Noam, en pixels 1080×1920) : le texte reste entre y = 250 et y = 1680, entre x = 60 et x = 1020, et à gauche de x = 895 sous y = 730 (colonne de boutons). L'iPhone rogne ~52 px de chaque côté.
- **Textes** : les textes réellement dessinés (position, taille, chevauchements, sortie de zone).
- **Sujets 3D** : un sujet coupé, caché, sous le sol ; sa couverture est mesurée sur sa partie visible.
- **Mots couverts** (le son) : un mot de la voix masqué par un bruitage trop fort.
- **Image noire**, **image doublée** (seulement si l'image bouge autour), **boucle** (raccord fin → début, seulement si les réglages disent « fin : boucle »).
- **Lettre absente** : une lettre (œ, « », espace fine…) que la police n'a pas, dessinée dans une police de secours ; **police non chargée**.
- **Contraste faible** : texte sans contour ni ombre qui se détache mal du fond (rapport < 3).
- **Passage mort** : rien ne bouge pendant 1,5 s ou plus (en dessous : « plan figé », info). Peut être voulu (pause avant une révélation) : à juger.
- **Vidéo exportée** : noir au début ou à la fin (grave), au milieu (moyen), gel, durée différente de celle du projet.

Check-list complète du relecteur (8 points, gravités, seuils) : `references/checklist-relecteur.md`, dans le dossier de cette skill (chemin complet).

## 4. Ce que les contrôles ne voient pas : à regarder sur les images

- Un texte **tronqué**, coupé en fin de ligne, ou mal espacé (« 24  H »).
- Un objet **coupé par le bord** du cadre.
- La **lisibilité sur téléphone** : taille, contraste, fond chargé.
- La cohérence avec la **direction artistique** du projet (`references/<style>.md`) et avec les sections voisines.
- **Aucun liseré coloré** à gauche d'un titre, d'une étiquette ou d'un cartouche : interdit pour tous les comptes.

## 5. Faux positifs déjà connus (méfiance avant de crier au défaut)

- Une roue tournée qui semble « sous le sol » : la boîte exacte des sommets est prise en compte.
- Un carton texte sur fond noir n'est pas une image noire.
- Une image fixe voulue n'est pas une image doublée.
- Les sous-titres mot par mot sont regroupés en lignes.
- Les mots pas encore dits peuvent être gris exprès : ce n'est pas un défaut de contraste.
- Une fin qui ne retombe pas sur le début n'est pas un défaut si les réglages disent « fin : plan large ».

Les points venus du **relecteur aveugle** (`source: aveugle`) sont « à vérifier » : il s'est déjà trompé (un n°7 lu au lieu d'un 2). Confirme-les sur l'image ou écarte-les, ne les recopie jamais tels quels.

## 6. Ta réponse

Une liste JSON, graves d'abord, rien d'inventé :

```json
[
  { "t": 12.5, "plan": "s03", "probleme": "titre coupé à droite par le bord", "gravite": "grave", "preuve": "qa/snaps/t12.500.png" }
]
```
- `gravite` : `grave`, `moyen` ou `info`.
- `preuve` : le PNG que tu as **réellement** regardé pour ce point.
- Un point par problème. Si un contrôle sonne mais que l'image le contredit, dis-le, avec `info`.

**Pour départager deux versions**, ne mets pas de notes : compare deux par deux (même plan, même instant), dis laquelle est meilleure et pourquoi.
