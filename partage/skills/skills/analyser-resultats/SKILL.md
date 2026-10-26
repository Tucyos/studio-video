---
name: analyser-resultats
description: Analyser les statistiques d'une vidéo TikTok / YouTube publiée (vues, temps regardé, taux de fin, rétention, réactions) face à la médiane des 20 dernières vidéos du compte, trouver pourquoi elle a marché ou décroché, et proposer la V2 (3 changements au plus, localisés). À utiliser pour « pourquoi ça n'a pas marché », « fais la V2 », ou quand la demande contient des chiffres de l'onglet Résultats.
metadata:
  source: "premier jet DeepSeek (22/10) relu et corrigé par Claude, d'après CLAUDE.md (Résultats, versions) et VISION-PRODUIT.md"
---

# Analyser les résultats d'une vidéo publiée

## 1. Règle d'or : rien n'est inventé

- Les chiffres viennent de la demande (le bouton « Préparer la demande à Claude » de l'onglet Résultats la pré-remplit) ou de ce que Noam colle. Aucun autre chiffre, aucune estimation.
- Une donnée absente s'écrit « - », et tu le dis : « temps moyen regardé : - (non fourni) ».
- Tu n'extrapoles pas : tu ne convertis pas un taux en nombre de vues.
- Sans aucune donnée exploitable, tu t'arrêtes et tu dis ce qui manque.

## 2. Comparer à la médiane des 20 dernières vidéos

- Référence : la **médiane des 20 dernières vidéos du compte**, jamais la moyenne. Une seule vidéo à plusieurs millions de vues fausserait la moyenne ; les très anciennes vidéos d'un compte ne reflètent plus le compte d'aujourd'hui.
- Moins de 20 vidéos : dis-le et prends la médiane de ce qui existe.
- Chaque chiffre est présenté **face à sa médiane**, avec l'écart en clair (au-dessus / en dessous).
- Ne mélange jamais TikTok et YouTube dans la même colonne.

## 3. Lire la courbe de rétention

Trois zones, dans cet ordre :
1. **Le hook (0-3 s)** : combien restent à 1, 2, 3 s. Une chute dès la première seconde accuse la première image ou la première phrase → skill `hook`.
2. **Les chutes nettes** : pour chacune, l'instant exact, le plan à cet instant (ce qu'on voit : `project.json` → `plans`) et le mot dit (`audio/words.json`). Regarde l'image : `node .studio/rendre.mjs <instant>`. Une chute a toujours un instant et une cause visuelle ou sonore.
3. **La fin** : le taux de vidéo finie. Une fin faible après un bon début = un ventre mou ou une chute mal amenée, pas un mauvais sujet.

Commentaires : cite-les tels quels (ce que les gens ont aimé, réclamé, corrigé). N'invente pas de tendance.

## 4. Diagnostic : 3 causes au plus

- Chaque cause a **une preuve** (un chiffre, un instant de la courbe, un commentaire cité). Sans preuve, pas de cause.
- Forme : « cause → preuve → effet supposé », la plus lourde d'abord.
- Distingue le **fond** (sujet, script) de la **forme** (hook, rythme, texte à l'écran, son).

## 5. Propositions de V2 : 3 au plus

- Classées par effet attendu, chacune **localisée** : quel plan, quel instant, quoi changer (hook, rythme, texte, son, montage).
- Interdit : « améliorer la rétention », « rendre plus dynamique », « travailler le hook ». Ce ne sont pas des propositions.
- Dis aussi **ce qui ne doit pas changer** : le passage qui retient, le plan qui marche, la phrase qui fait commenter.

## 6. Une version publiée est figée

- Tu ne peux rien modifier dans une version publiée (le studio refuse). Propose la V2 : Noam clique « Créer la V(n+1) », puis tu fais les changements. La V1 reste intacte.
- Tu ne publies jamais toi-même.

## 7. Ta réponse, dans cet ordre

1. **Résumé** : deux phrases. Ce qui a marché, où ça a décroché.
2. **Tableau** :

| Chiffre | Vidéo | Médiane (20 dernières) | Écart |
|---|---|---|---|
| Vues | … | … | … |
| Temps moyen regardé | … | … | … |
| Taux de vidéo finie | … | … | … |
| Likes | … | … | … |
| Commentaires | … | … | … |
| Partages | … | … | … |

   Une case sans donnée contient « - » ; une ligne sans donnée reste, pour montrer qu'elle manque.
3. **Diagnostic** : les causes, chacune avec sa preuve.
4. **Propositions V2**, puis ce qui ne doit pas changer.
5. Si une leçon vaut pour les prochaines vidéos de la niche, une dernière ligne `RÈGLE : …` (une phrase) : le studio propose de la retenir.

Phrases courtes, listes, aucun conseil générique. Si une conclusion dépend d'une donnée absente, écris « à confirmer ».
