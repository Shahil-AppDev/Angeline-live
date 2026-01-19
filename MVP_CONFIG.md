# Configuration MVP - Oracle Mystica Sentimental

## Oracle Unique pour le MVP

Pour simplifier le MVP, nous utilisons **uniquement** l'Oracle Mystica Sentimental.

### Caractéristiques

- **ID**: `ORACLE_MYSTICA`
- **Nom**: Oracle Mystica Sentimental
- **Cartes**: 70 cartes (mystica_sentimental_001.png à mystica_sentimental_070.png)
- **Thèmes**: Sentimental, Spirituel
- **Ton**: Mystique, romantique, profond
- **Path**: `assets/oracles_assets/ORACLE_MYSTICA/CORE`

### Configuration Appliquée

1. **config/oracles.json**
   - `fallback_oracle`: `ORACLE_MYSTICA`
   - `force_mode.enabled`: `true`
   - `force_mode.forced_oracle_id`: `ORACLE_MYSTICA`

2. **apps/live-core/src/index.ts**
   - Endpoint `/api/oracles` retourne uniquement ORACLE_MYSTICA
   - Tous les tirages utilisent automatiquement cet oracle

3. **apps/web-admin/src/app/dashboard/page.tsx**
   - Interface simplifiée sans sélecteur d'oracle
   - Affichage fixe: "Oracle Mystica Sentimental"
   - Pas de mode AUTO/FORCÉ (toujours ORACLE_MYSTICA)

### Avantages MVP

- ✅ Simplicité de configuration
- ✅ Expérience utilisateur cohérente
- ✅ Moins de maintenance
- ✅ Focus sur un seul oracle de qualité
- ✅ 70 cartes suffisantes pour des tirages variés

### Extension Future

Pour ajouter d'autres oracles après le MVP:
1. Désactiver `force_mode` dans `config/oracles.json`
2. Restaurer le sélecteur d'oracle dans le dashboard
3. Ajouter les assets des nouveaux oracles
4. Modifier l'endpoint `/api/oracles` pour retourner tous les oracles
