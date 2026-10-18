# Feuille de Route — Transformation Logistique

**Client :** TransLog Group  
**Secteur :** Transport et logistique  
**Effectif :** 280 salariés, 4 entrepôts  
**Période :** Janvier 2023 - Juin 2024 (18 mois)  
**Consultant référent :** Marie Dubois  
**Statut :** Mission terminée, bilan positif

---

## Contexte initial

TransLog, entreprise familiale de transport régional, fait face à une concurrence accrue des plateformes digitales. Les marges s'érodent (-3 points en 2 ans) et la satisfaction client diminue (retards, erreurs de livraison).

**Diagnostic initial (nov-déc 2022) :**

- Processus manuels (bons de livraison papier)
- Pas de visibilité temps réel sur les flux
- Inventaires erronés (écart moyen 12%)

---

## Vision cible

&gt; Devenir le transporteur régional de référence par la fiabilité et la transparence, grâce à une logistique digitalisée et des équipes autonomes.

---

## Chantiers et jalons

### Chantier 1 : Digitalisation du bon de livraison (Mois 1-4)

| Élément  | Détail                                                                    |
| -------- | ------------------------------------------------------------------------- |
| Objectif | Remplacer le papier par une application mobile chauffeur                  |
| Solution | Application métier développée sur mesure (React Native + API Python)      |
| Budget   | 45k€                                                                      |
| Jalons   | M1 : cahier des charges / M2-M3 : développement / M4 : déploiement pilote |

**Résultats obtenus :**

- -95% erreurs de saisie
- -2h/jour de saisie administrative par chauffeur
- Visibilité temps réel sur les livraisons

### Chantier 2 : Gestion des stocks temps réel (Mois 3-8)

| Élément  | Détail                                                        |
| -------- | ------------------------------------------------------------- |
| Objectif | Fiabiliser les inventaires et réduire les ruptures            |
| Solution | Scan codes-barres + synchronisation ERP                       |
| Budget   | 35k€                                                          |
| Jalons   | M3 : audit stocks / M4-M5 : paramétrage / M6-M8 : déploiement |

**Résultats obtenus :**

- Écart inventaire : 12% → 2%
- -30% ruptures de stock
- -20% temps de préparation commandes

### Chantier 3 : Autonomie des équipes d'entrepôt (Mois 6-12)

| Élément  | Détail                                                         |
| -------- | -------------------------------------------------------------- |
| Objectif | Passer d'une organisation hiérarchique à des équipes autonomes |
| Actions  | Formation management, rituels quotidiens, indicateurs visuels  |
| Budget   | 28k€ (formation + accompagnement)                              |
| Jalons   | M6-M7 : formation managers / M8-M12 : déploiement              |

**Résultats obtenus :**

- -25% absentéisme
- +15% productivité préparation
- Amélioration climat social (enquête interne +0,8 point)

### Chantier 4 : Optimisation des tournées (Mois 9-15)

| Élément  | Détail                                                                 |
| -------- | ---------------------------------------------------------------------- |
| Objectif | Réduire les coûts kilométriques et les délais                          |
| Solution | Logiciel d'optimisation des tournées (algorithme + contraintes métier) |
| Budget   | 40k€                                                                   |
| Jalons   | M9 : choix solution / M10-M12 : paramétrage / M13-M15 : déploiement    |

**Résultats obtenus :**

- -12% kilomètres parcourus
- -18% coûts carburant
- +10% livraisons à l'heure

---

## Bilan global (Juin 2024)

| Indicateur                | Avant  | Après  | Évolution  |
| ------------------------- | ------ | ------ | ---------- |
| Marge opérationnelle      | 8,2%   | 11,5%  | +3,3 pts   |
| Satisfaction client (NPS) | 32     | 58     | +26 points |
| Erreurs livraison         | 4,5%   | 0,8%   | -82%       |
| Turnover entrepôt         | 35%    | 18%    | -17 pts    |
| Coût par livraison        | 12,50€ | 10,20€ | -18%       |

**ROI global mission :** 180% sur 18 mois

---

## Facteurs clés de succès

| Facteur                                            | Commentaire                                         |
| -------------------------------------------------- | --------------------------------------------------- |
| Sponsorship DG constant                            | Réunions mensuelles de pilotage jamais décalées     |
| Implication des chefs d'entrepôt dès le diagnostic | Devenus ambassadeurs du changement                  |
| Approche pragmatique                               | Chaque chantier livré avant de passer au suivant    |
| Formation systématique                             | Aucun outil déployé sans formation des utilisateurs |

---

## Difficultés rencontrées et solutions

| Difficulté                                        | Solution apportée                                    |
| ------------------------------------------------- | ---------------------------------------------------- |
| Résistance des chauffeurs seniors à l'application | Binômes jeunes/anciens, valorisation des "champions" |
| ERP existant peu adaptable                        | Développement d'un middleware sur mesure             |
| Surcharge pendant les pics d'activité             | Calage des déploiements hors saison                  |
