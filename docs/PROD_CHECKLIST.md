# Checklist de Mise en Production - Angeline Live

## 📋 Préparation PC Windows

### ✅ Logiciels installés
- [ ] Node.js 20+ installé
- [ ] OBS Studio installé et configuré
- [ ] TikFinity Desktop installé
- [ ] TikTok Live Studio installé
- [ ] Git installé (pour mises à jour)

### ✅ Configuration OBS
- [ ] WebSocket activé (port 4455)
- [ ] Mot de passe WebSocket défini
- [ ] Scène IDLE créée avec sources :
  - [ ] TXT_USERNAME
  - [ ] TXT_QUESTION
  - [ ] TXT_RESPONSE
- [ ] Scène READING_ACTIVE créée avec sources :
  - [ ] CARD_1, CARD_2, CARD_3
  - [ ] FX_SMOKE
  - [ ] SFX_SHUFFLE, SFX_FLIP, SFX_POOF
- [ ] Virtual Camera activée
- [ ] Résolution : 1920x1080 (recommandé)

### ✅ Configuration PC Bridge
- [ ] `apps/pc-bridge` cloné
- [ ] `npm install` exécuté
- [ ] `.env` créé depuis `.env.example`
- [ ] `AUTH_TOKEN` généré (32+ caractères)
- [ ] `OBS_PASSWORD` configuré
- [ ] Port 8080 ouvert dans le firewall Windows
- [ ] Port forwarding configuré sur le routeur (8080)
- [ ] IP publique notée : `curl ifconfig.me`
- [ ] Test connexion : `npm run dev`
- [ ] Health check OK : `curl http://localhost:8080/health`

### ✅ Configuration TikFinity
- [ ] TikFinity Desktop lancé
- [ ] Port WebSocket vérifié (21213)
- [ ] Connexion TikTok établie
- [ ] Test événements OK

---

## 🖥️ Préparation VPS

### ✅ Déploiement Code
- [ ] Code poussé sur GitHub (branche main)
- [ ] GitHub Actions secrets configurés :
  - [ ] VPS_HOST
  - [ ] VPS_USERNAME
  - [ ] VPS_SSH_KEY
  - [ ] VPS_PORT
- [ ] Déploiement automatique testé
- [ ] Services PM2 démarrés :
  - [ ] angeline-live-core (port 7000)
  - [ ] angeline-web-admin (port 7001)

### ✅ Configuration Live-Core
- [ ] `.env` mis à jour avec :
  - [ ] `PC_BRIDGE_URL=ws://IP_PUBLIQUE_PC:8080`
  - [ ] `PC_BRIDGE_TOKEN=même_token_que_pc_bridge`
  - [ ] `MODE=production`
  - [ ] `DEEPSEEK_API_KEY` configuré
  - [ ] `ELEVENLABS_API_KEY` configuré
- [ ] Assets oracle accessibles via `/assets/oracles/`
- [ ] Manifest oracle validé
- [ ] Test API : `curl https://live.angeline-nj.xyz/api/health`

### ✅ Configuration Nginx
- [ ] Reverse proxy configuré (ports 7000/7001)
- [ ] SSL/TLS actif (Let's Encrypt)
- [ ] WebSocket supporté
- [ ] Headers sécurité activés

---

## 🔗 Tests de Connexion

### ✅ PC → VPS
- [ ] PC Bridge démarré : `npm start` dans `apps/pc-bridge`
- [ ] VPS peut atteindre PC : `curl http://IP_PC:8080/health` depuis VPS
- [ ] WebSocket établi entre VPS et PC
- [ ] Logs PC Bridge montrent connexion VPS

### ✅ VPS → PC
- [ ] Live-core connecté au PC Bridge
- [ ] Commandes OBS envoyées depuis VPS
- [ ] Événements TikFinity reçus sur VPS
- [ ] Logs live-core montrent événements TikTok

### ✅ Tests Fonctionnels
- [ ] Commande `!oracle` détectée
- [ ] Tirage de 3 cartes effectué
- [ ] Cartes affichées dans OBS
- [ ] Réponse IA générée
- [ ] TTS joué (ElevenLabs)
- [ ] Scènes OBS changées automatiquement

---

## 🎯 Tests End-to-End

### ✅ Scénario 1 : Tirage Oracle
1. [ ] Utilisateur envoie `!oracle` dans chat TikTok
2. [ ] PC Bridge relaie l'événement au VPS
3. [ ] Live-core détecte la commande
4. [ ] 3 cartes tirées aléatoirement
5. [ ] VPS envoie commandes OBS via PC Bridge
6. [ ] OBS affiche les 3 cartes séquentiellement
7. [ ] Effets sonores joués (shuffle, flip)
8. [ ] IA génère réponse basée sur 2 mots-clés par carte
9. [ ] TTS génère audio de la réponse
10. [ ] Réponse affichée dans OBS (TXT_RESPONSE)

### ✅ Scénario 2 : Question Personnalisée
1. [ ] Utilisateur envoie question : "Vais-je trouver l'amour ?"
2. [ ] Live-core détecte question
3. [ ] Tirage de 3 cartes
4. [ ] IA fusionne mots-clés pour répondre à la question
5. [ ] Réponse personnalisée générée
6. [ ] TTS et affichage OK

### ✅ Scénario 3 : Gift Trigger
1. [ ] Utilisateur envoie un gift (Rose, 1 diamant)
2. [ ] Live-core détecte le gift
3. [ ] Tirage automatique déclenché
4. [ ] Remerciement personnalisé
5. [ ] Affichage OK

---

## 🔒 Sécurité

### ✅ Tokens et Secrets
- [ ] `AUTH_TOKEN` unique et sécurisé (32+ chars)
- [ ] Tokens jamais commités dans Git
- [ ] `.env` dans `.gitignore`
- [ ] GitHub Secrets configurés
- [ ] API Keys DeepSeek et ElevenLabs sécurisées

### ✅ Firewall et Réseau
- [ ] Port 8080 PC ouvert uniquement pour IP VPS (recommandé)
- [ ] SSL/TLS actif sur VPS
- [ ] Nginx configuré avec headers sécurité
- [ ] Rate limiting activé sur API

---

## 📊 Monitoring

### ✅ Logs
- [ ] PC Bridge : `logs/combined.log`
- [ ] Live-core : PM2 logs `pm2 logs angeline-live-core`
- [ ] Nginx : `/var/log/nginx/live.angeline-nj.xyz-*.log`

### ✅ Health Checks
- [ ] PC Bridge : `http://IP_PC:8080/health`
- [ ] PC Bridge Status : `http://IP_PC:8080/status`
- [ ] Live-core API : `https://live.angeline-nj.xyz/api/health`
- [ ] Web-admin : `https://live.angeline-nj.xyz`

### ✅ Alertes
- [ ] Monitoring uptime configuré (optionnel)
- [ ] Notifications Discord/Telegram (optionnel)

---

## 🚀 Go Live

### ✅ Démarrage
1. [ ] Lancer OBS Studio
2. [ ] Lancer TikFinity Desktop
3. [ ] Connecter TikFinity à TikTok
4. [ ] Lancer PC Bridge : `npm start`
5. [ ] Vérifier connexions : `curl http://localhost:8080/status`
6. [ ] Vérifier VPS : `pm2 status`
7. [ ] Ouvrir Web-admin : `https://live.angeline-nj.xyz`
8. [ ] Cliquer "Start Live" dans le dashboard
9. [ ] Lancer TikTok Live Studio
10. [ ] Sélectionner OBS Virtual Camera
11. [ ] Démarrer le live TikTok

### ✅ Pendant le Live
- [ ] Surveiller logs PC Bridge
- [ ] Surveiller dashboard web-admin
- [ ] Vérifier réactivité des commandes
- [ ] Vérifier qualité TTS
- [ ] Vérifier affichage OBS

### ✅ Arrêt
1. [ ] Arrêter le live TikTok
2. [ ] Cliquer "Stop Live" dans le dashboard
3. [ ] Arrêter TikFinity Desktop
4. [ ] Arrêter PC Bridge (Ctrl+C)
5. [ ] Arrêter OBS Studio

---

## 🐛 Dépannage Rapide

### PC Bridge ne démarre pas
- Vérifier `.env` configuré
- Vérifier OBS lancé
- Vérifier TikFinity lancé
- Voir logs : `logs/error.log`

### VPS ne reçoit pas les événements
- Vérifier firewall PC
- Vérifier port forwarding routeur
- Tester depuis VPS : `curl http://IP_PC:8080/health`
- Vérifier token identique PC et VPS

### OBS ne réagit pas
- Vérifier WebSocket OBS activé
- Vérifier mot de passe OBS correct
- Vérifier sources OBS existent
- Voir logs PC Bridge

### Pas de TTS
- Vérifier `ELEVENLABS_API_KEY`
- Vérifier quota ElevenLabs
- Voir logs live-core

### Cartes ne s'affichent pas
- Vérifier chemins assets : `/assets/oracles/`
- Vérifier manifest oracle
- Vérifier sources CARD_1, CARD_2, CARD_3 dans OBS

---

## ✅ Validation Finale

- [ ] Tous les tests passent
- [ ] Live test de 5 minutes OK
- [ ] Aucune erreur dans les logs
- [ ] Performance acceptable (< 500ms réponse)
- [ ] Qualité TTS satisfaisante
- [ ] Affichage OBS fluide

**🎉 Système prêt pour la production !**
