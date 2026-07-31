# 🚴‍♂️ VeloStock PWA

Application Progressive Web App (PWA) de gestion et commande de stock d'équipements de cyclisme (maillots, cuissards, vestes thermiques, etc.).

## 🚀 Fonctionnalités

- **Espace Visiteur :**
  - Consultation du catalogue par catégorie et niveau de stock par taille.
  - Passage de commande réglable par virement bancaire.
  - Demande de réapprovisionnement pour les articles hors-stock.
- **Espace Gestionnaire / Admin :**
  - Gestion des stocks et prix par déclinaison (tailles).
  - Ajout de nouveaux produits au catalogue.
  - Suivi des demandes de réapprovisionnement.
- **PWA :** Installable sur mobile/desktop, exécutable hors-ligne via Service Worker.

## 🛠️ Installation & Lancement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Générer le build de production
npm run build