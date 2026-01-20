# Configuration des Secrets GitHub

## 🔐 Secrets Requis pour le Déploiement Automatique

Les warnings dans `.github/workflows/deploy.yml` indiquent que vous devez configurer les secrets GitHub suivants.

---

## 📋 Liste des Secrets

| Nom du Secret | Valeur | Description |
|---------------|--------|-------------|
| `VPS_HOST` | `77.42.34.90` | Adresse IP du VPS Hetzner |
| `VPS_USERNAME` | `root` | Nom d'utilisateur SSH |
| `VPS_SSH_KEY` | Votre clé SSH privée | Clé SSH pour l'authentification |
| `VPS_PORT` | `22` | Port SSH (par défaut 22) |

---

## 🚀 Configuration sur GitHub

### Étape 1: Accéder aux Secrets

1. Allez sur votre repository GitHub: `https://github.com/Shahil-AppDev/Angeline-live`
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu latéral, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**

### Étape 2: Ajouter Chaque Secret

Pour chaque secret de la liste ci-dessus:

1. **Name**: Entrez le nom exact du secret (ex: `VPS_HOST`)
2. **Secret**: Entrez la valeur correspondante
3. Cliquez sur **Add secret**

### Étape 3: Récupérer la Clé SSH

Si vous avez déjà fourni votre clé SSH, utilisez-la. Sinon, récupérez-la depuis le VPS:

```bash
# Sur votre PC Windows
ssh root@77.42.34.90 "cat ~/.ssh/id_rsa"
```

Copiez **TOUTE** la sortie, de `-----BEGIN OPENSSH PRIVATE KEY-----` à `-----END OPENSSH PRIVATE KEY-----`.

---

## ✅ Vérification

Une fois tous les secrets configurés:

1. Allez dans **Actions** sur GitHub
2. Vérifiez qu'il n'y a pas d'erreurs d'authentification
3. Faites un push pour tester le déploiement automatique:

```bash
git add .
git commit -m "Test deployment"
git push origin main
```

4. Surveillez l'onglet **Actions** pour voir le workflow s'exécuter

---

## 🔧 Dépannage

### Erreur: "Permission denied (publickey)"

- Vérifiez que `VPS_SSH_KEY` contient la clé privée complète
- Vérifiez que la clé publique correspondante est dans `/root/.ssh/authorized_keys` sur le VPS

### Erreur: "Host key verification failed"

- Normal lors de la première connexion
- Le workflow utilise `StrictHostKeyChecking=no` pour éviter ce problème

### Les secrets ne sont pas visibles

- C'est normal, GitHub masque les secrets pour la sécurité
- Vous ne pouvez pas voir leur valeur après les avoir ajoutés
- Vous pouvez seulement les supprimer et les recréer

---

## 📝 Note Importante

**Les secrets GitHub sont chiffrés et sécurisés.** Ils ne sont jamais exposés dans les logs ou l'historique Git.

Une fois configurés, le déploiement automatique fonctionnera à chaque push sur la branche `main`.
