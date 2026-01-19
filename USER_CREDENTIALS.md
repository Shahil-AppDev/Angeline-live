# 🔐 Identifiants Admin - Angeline NJ Live

## Utilisateur Créé

**Username:** `admin`  
**Password:** `admin123`

## Accès Dashboard

**URL:** http://localhost:3000

## Connexion

1. Ouvre http://localhost:3000 dans ton navigateur
2. Entre les identifiants ci-dessus
3. Tu seras redirigé vers le dashboard

## Sécurité

- Le mot de passe est hashé avec bcrypt dans le fichier `.env`
- Le hash actuel: `$2a$10$ZmFoIUwOGiFN6l9VOJCoqeSLd7gHb5yZMkCC69W4nPduatQaA/kVy`
- JWT utilisé pour les sessions (secret configuré dans `.env`)

## Changer le Mot de Passe

Pour créer un nouveau mot de passe hashé:

```bash
npm run create-user
```

Puis copie le hash généré dans `.env` sous `ADMIN_PASSWORD_HASH`.

---

⚠️ **IMPORTANT:** Ne commite jamais ce fichier dans Git. Il est déjà dans `.gitignore`.
