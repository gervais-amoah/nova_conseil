# Spec Produit Finale — Novae Conseil Internal Tools

## 1. Vision

| Élément          | Définition                                                                        |
| ---------------- | --------------------------------------------------------------------------------- |
| **Problème**     | Connaissance éparpillée, réinvention à chaque mission, triage manuel des demandes |
| **Solution**     | Plateforme interne centralisant requêtes, clients, projets + RAG sur Drive        |
| **Utilisateurs** | Consultants, coachs, commerciaux, admin (25 personnes)                            |
| **Valeur**       | Temps gagné, capitalisation expertise, onboarding accéléré                        |

---

## 2. Personas

| Persona        | Rôle                 | Permissions                               |
| -------------- | -------------------- | ----------------------------------------- |
| **Admin**      | Office manager / ops | Tout voir, tout faire, monitoring         |
| **Consultant** | Production missions  | Requêtes/projets département `consulting` |
| **Commercial** | Avant-vente          | Requêtes/projets département `commercial` |
| **Coach**      | Accompagnement       | Requêtes/projets département `coaching`   |
| **Support**    | Ops, finance, RH     | Requêtes/projets département `support`    |
| **Invité**     | Démonstration        | Lecture seule, aucune action              |

---

## 3. Architecture des pages

### 3.1 Espace public (`/public`)

| Page            | Contenu                           |
| --------------- | --------------------------------- |
| `/`             | Landing vitrine Novae Conseil     |
| `/contact`      | Formulaire demande (crée requête) |
| `/confirmation` | Message de confirmation           |

### 3.2 Espace admin (`/admin`)

| Page                  | Contenu                                                  | Accès             |
| --------------------- | -------------------------------------------------------- | ----------------- |
| `/admin/login`        | Email, password, sélecteur rôle, option "Invité"         | Tous              |
| `/admin/dashboard`    | Stats rapides, dernières requêtes, alertes               | Tous (scoped)     |
| `/admin/requetes`     | Tableau requêtes filtrable                               | Tous (scoped)     |
| `/admin/requetes/:id` | Détail + correction catégorisation + traitement RAG      | Tous (scoped)     |
| `/admin/clients`      | Tableau clients + CRUD                                   | Admin, Commercial |
| `/admin/clients/:id`  | Détail client + projets + requêtes                       | Admin, Commercial |
| `/admin/projets`      | Tableau projets filtrable                                | Tous (scoped)     |
| `/admin/projets/:id`  | Détail projet + changement statut + association requêtes | Tous (scoped)     |
| `/admin/monitoring`   | Performance IA : catégorisation + RAG                    | Admin uniquement  |

---

## 4. Modèle de données

### 4.1 Entités

```
Utilisateur
├── id, email, password, nom, role
└── role: admin | consultant | commercial | coach | support | invite

Client
├── id, nom, secteur, taille, contact_nom, contact_email
└── relation: has_many Projets, has_many Requêtes

Projet
├── id, client_id (fk), nom, description, statut
├── date_debut, date_fin
└── statuts: prospect | signe | en_cours | en_pause | bloque | livre | annule

Requête
├── id, client_id (fk, nullable), projet_id (fk, nullable)
├── sujet, description, email_contact
├── departement (nullable)
├── departement_confiance (float)
├── departement_corrige (boolean)
├── raison_correction (text, nullable)
├── statut: nouvelle | assignee | en_cours | resolue
└── dates création, résolution

MonitoringCatégorisation
├── id, requete_id (fk)
├── departement_suggere, confiance
├── departement_final, corrige (boolean)
├── raison_correction, timestamp

MonitoringRAG
├── id, requete_id (fk, nullable)
├── query, documents_retournes, temps_reponse
├── timestamp
```

### 4.2 Relations

```
Client 1 ─── n Projet
Client 1 ─── n Requête
Projet 1 ─── n Requête (nullable)
Requête 1 ─── 0..1 MonitoringCatégorisation
Requête 1 ─── 0..n MonitoringRAG
```

---

## 5. User Stories

### Phase 0 — Full-stack classique

| #    | Story                                                                  | Priorité |
| ---- | ---------------------------------------------------------------------- | -------- |
| 0.1  | En tant que **visiteur**, je soumets une demande via formulaire public | P0       |
| 0.2  | En tant qu'**employé**, je me connecte avec email/password/rôle        | P0       |
| 0.3  | En tant qu'**invité**, je navigue en lecture seule                     | P0       |
| 0.4  | En tant qu'**admin**, je vois le dashboard avec stats                  | P0       |
| 0.5  | En tant qu'**utilisateur**, je consulte la liste des requêtes (scoped) | P0       |
| 0.6  | En tant qu'**utilisateur**, je consulte le détail d'une requête        | P0       |
| 0.7  | En tant qu'**admin/commercial**, je crée un client externe             | P0       |
| 0.8  | En tant qu'**utilisateur**, je consulte la liste des projets (scoped)  | P0       |
| 0.9  | En tant qu'**utilisateur**, je change le statut d'un projet            | P0       |
| 0.10 | En tant qu'**admin**, j'associe une requête à un projet existant       | P0       |
| 0.11 | En tant qu'**admin**, je crée un projet et y associe des requêtes      | P0       |

### Phase 1 — Catégorisation IA

| #   | Story                                                                                                                    | Priorité |
| --- | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| 1.1 | En tant que **système**, je catégorise automatiquement une requête à sa création                                         | P0       |
| 1.2 | En tant qu'**employé**, je vois la notification d'ajout d'une nouvelle requête (apres catégorisation reussie ou echouée) | P0       |
| 1.3 | En tant qu'**employé**, je peux changer la catégorisation (par exemple: `consulting` -> `commercial`)                    | P0       |
| 1.4 | En tant qu'**admin**, je consulte le monitoring catégorisation                                                           | P0       |

### Phase 2 — RAG

| #   | Story                                                                                                                    | Priorité |
| --- | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| 2.1 | En tant qu'**employé**, je déclenche le RAG sur une requête (si son traitement nécessite de lire les documents internes) | P1       |
| 2.2 | En tant qu'**employé**, je vois le résultat du RAG (process + citations: nom du document et section si possible)         | P1       |
| 2.3 | En tant qu'**admin**, je consulte le monitoring RAG                                                                      | P1       |

---

## 6. Flux utilisateurs

### 6.1 Flux public → admin

```
[Client externe]                    [Employé cabinet]
     |                                    |
     v                                    v
Landing → Formulaire → Submit      Dashboard (notification SSE)
                            |            |
                            v            v
                    [Backend: création    Voir requête
                     requête statut:       "Analyse en cours..."
                     nouvelle]             |
                            |              v
                            v         "Catégorisée: Consulting (87%)"
                     [Appel LLM sync]      |
                            |              v
                            v         Requête visible dans
                     Mise à jour:          onglet Consulting
                     departement,          |
                     confiance             v
                            |         [Peut corriger si erreur]
                     SSE notification
```

### 6.2 Flux traitement requête

```
Requête détail (statut: nouvelle)
├── Voir infos client, sujet, description
├── Voir catégorisation: "Consulting (87%)"
├── [Si erreur] Corriger → select département → raison → sauvegarder
│   └── Log dans MonitoringCatégorisation
│
├── Bouton "Traiter avec IA" (Phase 2)
│   └── RAG → process + citations
│   └── Log dans MonitoringRAG
│
├── Section "Association projet"
│   ├── [Associer à projet existant] → select projet → confirmer
│   ├── [Créer nouveau projet] → formulaire → créer + associer
│   └── Requête statut → "en_cours"
│
└── Bouton "Résoudre"
    └── Statut → "resolue"
```

### 6.3 Flux projet

```
Projet détail
├── Informations: client, nom, description, dates
├── Statut actuel + [Changer statut]
│   └── Select: prospect → signe → en_cours → livré
│   └── Détours: en_pause, bloqué (depuis en_cours)
│   └── Sortie: annulé (depuis n'importe quel actif)
└── Requêtes associées (liste)
    └── [Retirer requête] (délier, ne pas supprimer)
```

---

## 7. Spécifications fonctionnelles

### 7.1 Authentification

| Champ    | Type           | Notes                                         |
| -------- | -------------- | --------------------------------------------- |
| Email    | Input email    | Format validé                                 |
| Password | Input password | Simple hash (démo)                            |
| Rôle     | Select         | Admin, Consultant, Commercial, Coach, Support |
| Bouton   | Submit         | Redirection `/admin/dashboard`                |

Le bouton "Continuer en tant qu'invité" permet de se connecter directement, sans remplir le formulaire.

**Comportement Invité** : tous les boutons d'action désactivés.

### 7.2 Dashboard

| Widget             | Contenu                              | Source |
| ------------------ | ------------------------------------ | ------ |
| Card requêtes      | Total, nouvelles, en cours, résolues | BDD    |
| Card projets       | Actifs, livrés ce mois, bloqués      | BDD    |
| Dernières requêtes | 5 dernières avec statut              | BDD    |
| Alertes            | Non catégorisées, projets bloqués    | BDD    |

### 7.3 Tableau requêtes

| Colonne       | Triable | Filtre     |
| ------------- | ------- | ---------- |
| ID            | Oui     | —          |
| Date création | Oui     | Date range |
| Client/Email  | Oui     | Texte      |
| Sujet         | Oui     | Texte      |
| Département   | Oui     | Select     |
| Statut        | Oui     | Select     |
| Confiance IA  | Oui     | Seuil min  |

**Scoped par rôle** : Consultant voit `departement=consulting`, etc. Admin voit tout.

**Actions ligne** : Voir détail

### 7.4 Détail requête

| Section                 | Contenu                                               | Actions                   |
| ----------------------- | ----------------------------------------------------- | ------------------------- |
| Informations            | Tous champs                                           | —                         |
| Catégorisation IA       | Département, confiance, badge "corrigé" si applicable | [Corriger]                |
| Traitement IA (Phase 2) | Process + citations                                   | [Traiter avec IA]         |
| Association projet      | Projet lié ou "Aucun"                                 | [Associer] [Créer projet] |
| Résolution              | Date résolution si résolue                            | [Résoudre]                |

### 7.5 Correction catégorisation

| Élément            | Comportement                        |
| ------------------ | ----------------------------------- |
| Bouton "Corriger"  | Ouvre modal                         |
| Select département | 4 options + "Autre"                 |
| Raison (optionnel) | Texte libre                         |
| Sauvegarder        | Met à jour requête + log monitoring |

### 7.6 Page monitoring

**Onglet Catégorisation**

| Section           | Contenu                                      |
| ----------------- | -------------------------------------------- |
| KPIs              | Total, précision %, temps moyen              |
| Graphique         | Précision par département (bar chart simple) |
| Table corrections | Date, requête, suggéré, final, raison        |

**Onglet RAG**

| Section        | Contenu                                            |
| -------------- | -------------------------------------------------- |
| KPIs           | Total requêtes, temps moyen, docs moyens retournés |
| Table requêtes | Date, requête, temps, nb docs                      |

---

## 8. API Endpoints

### 8.1 Auth

| Méthode | Endpoint          | Description              |
| ------- | ----------------- | ------------------------ |
| POST    | `/api/auth/login` | Connexion, retourne rôle |
| GET     | `/api/auth/me`    | Utilisateur courant      |

### 8.2 Requêtes

| Méthode | Endpoint                     | Description                       |
| ------- | ---------------------------- | --------------------------------- |
| GET     | `/api/requetes`              | Liste (scoped, filtrable)         |
| GET     | `/api/requetes/:id`          | Détail                            |
| POST    | `/api/requetes`              | Création (public)                 |
| PATCH   | `/api/requetes/:id`          | Mise à jour (statut, département) |
| POST    | `/api/requetes/:id/corriger` | Correction catégorisation         |
| POST    | `/api/requetes/:id/traiter`  | Déclenche RAG (Phase 2)           |
| POST    | `/api/requetes/:id/associer` | Associer à projet                 |
| POST    | `/api/requetes/:id/resoudre` | Marquer résolue                   |

**Important pour la création d'une requête:**
On limite le nombre de caractères du champ description, et le nombre de requêtes (1 par seconde, 30 par jours) pour ne pas surchager le backend ou nos services IA. Toute requête additionnelle envoie un message warning simple et clair au frontend.
Aussi, on securise l'endpoint contre tout types d'injections malveillants ou attaques.

### 8.3 Clients

| Méthode | Endpoint           | Description                 |
| ------- | ------------------ | --------------------------- |
| GET     | `/api/clients`     | Liste                       |
| GET     | `/api/clients/:id` | Détail + projets + requêtes |
| POST    | `/api/clients`     | Création                    |
| PATCH   | `/api/clients/:id` | Mise à jour                 |

### 8.4 Projets

| Méthode | Endpoint                           | Description                 |
| ------- | ---------------------------------- | --------------------------- |
| GET     | `/api/projets`                     | Liste (scoped, filtrable)   |
| GET     | `/api/projets/:id`                 | Détail + requêtes associées |
| POST    | `/api/projets`                     | Création                    |
| PATCH   | `/api/projets/:id`                 | Mise à jour (statut)        |
| POST    | `/api/projets/:id/ajouter-requete` | Associer requête            |
| POST    | `/api/projets/:id/retirer-requete` | Dissocier requête           |

### 8.5 Monitoring

| Méthode | Endpoint                         | Description                |
| ------- | -------------------------------- | -------------------------- |
| GET     | `/api/monitoring/categorisation` | Stats + corrections        |
| GET     | `/api/monitoring/rag`            | Stats + requêtes (Phase 2) |

### 8.6 SSE

| Méthode | Endpoint      | Description            |
| ------- | ------------- | ---------------------- |
| GET     | `/api/events` | Flux SSE notifications |

---

## 9. Phases de livraison

### Phase 0 — Full-stack classique

| Livrable        | Contenu                                      |
| --------------- | -------------------------------------------- |
| Backend         | API REST complète (auth, CRUD, associations) |
| Frontend public | Landing + formulaire + confirmation          |
| Frontend admin  | Login, dashboard, requêtes, clients, projets |
| BDD             | Schéma complet, seed data                    |
| Git             | Repo initialisé, commits propres             |

### Phase 1 — Catégorisation IA

| Livrable   | Contenu                                            |
| ---------- | -------------------------------------------------- |
| Backend    | Intégration LLM, endpoint catégorisation, SSE      |
| Frontend   | Notification temps réel, correction catégorisation |
| Monitoring | Page monitoring catégorisation                     |
| BDD        | Table MonitoringCatégorisation                     |

### Phase 1.1 — Déploiement v1

| Livrable    | Contenu                                |
| ----------- | -------------------------------------- |
| Déploiement | App en ligne (Render, Railway, ou VPS) |
| Demo        | Scénario de démo v1                    |

### Phase 2 — RAG

| Livrable   | Contenu                                        |
| ---------- | ---------------------------------------------- |
| Backend    | Pipeline RAG (chunking, embeddings, retrieval) |
| Frontend   | Bouton "Traiter avec IA", affichage citations  |
| Monitoring | Onglet monitoring RAG                          |
| BDD        | Table MonitoringRAG                            |

### Phase 2.1 — Déploiement v2

| Livrable    | Contenu                     |
| ----------- | --------------------------- |
| Déploiement | App mise à jour             |
| Demo        | Scénario de démo v2 complet |

---

## 10. Critères de succès

| Phase | Critère                            | Vérification                        |
| ----- | ---------------------------------- | ----------------------------------- |
| 0     | CRUD complet fonctionnel           | Tester toutes routes API            |
| 0     | 2 interfaces distinctes            | /public et /admin                   |
| 0     | Scoped par rôle                    | Login consultant, vérifier filtrage |
| 1     | Catégorisation < 10s               | Chronométrer                        |
| 1     | Notification temps réel            | Soumettre formulaire, voir toast    |
| 1     | Correction visible dans monitoring | Corriger, vérifier table            |
| 2     | RAG retourne citations exactes     | Vérifier source + extrait           |
| 2     | Monitoring RAG complet             | Déclencher RAG, vérifier log        |
