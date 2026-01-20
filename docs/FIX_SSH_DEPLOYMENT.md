# 🔧 Correction de l'Erreur SSH GitHub Actions

## ❌ Erreur Rencontrée

```
ssh: handshake failed: ssh: unable to authenticate, attempted methods [none publickey], no supported methods remain
```

Cette erreur indique que GitHub Actions ne peut pas s'authentifier sur le VPS avec la clé SSH fournie.

---

## 🔍 Causes Possibles

1. **Secret `VPS_SSH_KEY` non configuré** dans GitHub
2. **Clé SSH au mauvais format** (doit être la clé PRIVÉE complète)
3. **Clé publique non ajoutée** sur le VPS dans `~/.ssh/authorized_keys`
4. **Permissions incorrectes** sur le VPS

---

## ✅ Solution Étape par Étape

### 1. Générer une Paire de Clés SSH (si nécessaire)

Sur votre PC local ou directement sur le VPS:

```bash
# Générer une nouvelle paire de clés
ssh-keygen -t ed25519 -C "github-actions-angeline-live" -f ~/.ssh/github_actions_angeline

# Cela crée 2 fichiers:
# - github_actions_angeline (clé PRIVÉE) → pour GitHub Secret
# - github_actions_angeline.pub (clé PUBLIQUE) → pour le VPS
```

### 2. Ajouter la Clé Publique sur le VPS

Connectez-vous au VPS:

```bash
ssh root@77.42.34.90
```

Ajoutez la clé publique:

```bash
# Créer le dossier .ssh si nécessaire
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Ajouter la clé publique
cat >> ~/.ssh/authorized_keys << 'EOF'
COLLEZ_ICI_LE_CONTENU_DE_github_actions_angeline.pub
EOF

# Définir les bonnes permissions
chmod 600 ~/.ssh/authorized_keys
chown -R root:root ~/.ssh
```

### 3. Configurer le Secret GitHub

#### A. Récupérer la Clé Privée

Sur votre PC local:

```bash
# Afficher la clé PRIVÉE complète
cat ~/.ssh/github_actions_angeline
```

**IMPORTANT:** Copiez **TOUT** le contenu, de `-----BEGIN OPENSSH PRIVATE KEY-----` jusqu'à `-----END OPENSSH PRIVATE KEY-----` inclus.

#### B. Ajouter le Secret sur GitHub

1. Allez sur: `https://github.com/Shahil-AppDev/Angeline-live/settings/secrets/actions`
2. Cliquez sur **New repository secret**
3. Name: `VPS_SSH_KEY`
4. Secret: Collez la clé PRIVÉE complète (avec BEGIN et END)
5. Cliquez sur **Add secret**

### 4. Vérifier les Autres Secrets

Assurez-vous que ces secrets sont également configurés:

| Secret | Valeur |
|--------|--------|
| `VPS_HOST` | `77.42.34.90` |
| `VPS_USERNAME` | `root` |
| `VPS_PORT` | `22` |
| `VPS_SSH_KEY` | Clé PRIVÉE complète |

---

## 🧪 Tester la Connexion SSH

Avant de relancer le workflow GitHub, testez manuellement:

```bash
# Depuis votre PC local
ssh -i ~/.ssh/github_actions_angeline root@77.42.34.90

# Si ça fonctionne, vous devriez être connecté au VPS
```

---

## 🔄 Relancer le Déploiement

Une fois les secrets configurés:

1. Allez sur: `https://github.com/Shahil-AppDev/Angeline-live/actions`
2. Sélectionnez le workflow **Deploy Angeline Live to VPS**
3. Cliquez sur **Run workflow** → **Run workflow**
4. Surveillez les logs pour vérifier que l'authentification fonctionne

---

## 🛠️ Alternative: Utiliser une Clé SSH Existante

Si vous avez déjà une clé SSH qui fonctionne pour vous connecter au VPS:

```bash
# Afficher votre clé privée actuelle
cat ~/.ssh/id_rsa
# OU
cat ~/.ssh/id_ed25519

# Copiez TOUT le contenu et ajoutez-le comme secret VPS_SSH_KEY
```

---

## 📝 Format Correct de la Clé SSH

La clé PRIVÉE doit ressembler à ceci:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBqL9ZqJZ8fJ7qH5J9qL9ZqJZ8fJ7qH5J9qL9ZqJZ8fJwAAAJgqL9ZqKi/W
aioAAAAAAAAAAQAAAAtzc2gtZWQyNTUxOQAAACBqL9ZqJZ8fJ7qH5J9qL9ZqJZ8fJ7qH5J
... (plusieurs lignes) ...
-----END OPENSSH PRIVATE KEY-----
```

**NE PAS** utiliser la clé publique (.pub) dans le secret GitHub!

---

## ✅ Checklist de Vérification

- [ ] Clé SSH générée (ou existante récupérée)
- [ ] Clé publique ajoutée sur VPS dans `~/.ssh/authorized_keys`
- [ ] Permissions correctes sur VPS (`chmod 600 ~/.ssh/authorized_keys`)
- [ ] Secret `VPS_SSH_KEY` configuré sur GitHub avec la clé PRIVÉE complète
- [ ] Secrets `VPS_HOST`, `VPS_USERNAME`, `VPS_PORT` configurés
- [ ] Test manuel SSH réussi
- [ ] Workflow GitHub Actions relancé

---

## 🆘 Dépannage

### Erreur persiste après configuration

```bash
# Sur le VPS, vérifier les logs SSH
tail -f /var/log/auth.log

# Vérifier les permissions
ls -la ~/.ssh/
# Doit afficher:
# drwx------ 2 root root 4096 ... .ssh
# -rw------- 1 root root  xxx ... authorized_keys
```

### Tester avec verbose

```bash
ssh -vvv -i ~/.ssh/github_actions_angeline root@77.42.34.90
# Les logs détaillés montreront où ça bloque
```

---

## 📚 Ressources

- [GitHub Actions SSH Action](https://github.com/appleboy/ssh-action)
- [SSH Key Authentication](https://www.ssh.com/academy/ssh/public-key-authentication)
- [Troubleshooting SSH](https://docs.github.com/en/authentication/troubleshooting-ssh)
