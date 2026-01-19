#!/bin/bash

# Script de configuration PostgreSQL pour Angeline Live

echo "🔧 Configuration de PostgreSQL pour Angeline Live..."

# Créer l'utilisateur PostgreSQL
sudo -u postgres psql << EOF
CREATE USER angeline_admin WITH PASSWORD 'Angeline2026';
GRANT ALL PRIVILEGES ON DATABASE angeline_live TO angeline_admin;
ALTER DATABASE angeline_live OWNER TO angeline_admin;
\c angeline_live
GRANT ALL ON SCHEMA public TO angeline_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO angeline_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO angeline_admin;
EOF

echo "✅ Utilisateur PostgreSQL créé"
echo "   Username: angeline_admin"
echo "   Password: Angeline2026"
echo "   Database: angeline_live"

# Configurer le .env.production
cd /var/www/angeline-live/apps/web-admin

cat > .env.production << 'ENVEOF'
# Database
DATABASE_URL="postgresql://angeline_admin:Angeline2026@localhost:5432/angeline_live?schema=public"

# JWT Secret (généré aléatoirement)
JWT_SECRET="$(openssl rand -base64 32)"

# Node Environment
NODE_ENV=production
ENVEOF

echo "✅ Fichier .env.production créé"

# Exécuter les migrations Prisma
cd /var/www/angeline-live/apps/web-admin
npx prisma migrate deploy

echo "✅ Migrations Prisma exécutées"

# Créer l'utilisateur admin pour le dashboard
node << 'NODEOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash('Admin2026!', 10);
    
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash: passwordHash,
        role: 'admin'
      }
    });
    
    console.log('✅ Utilisateur admin créé pour le dashboard');
    console.log('   Username: admin');
    console.log('   Password: Admin2026!');
    console.log('   URL: https://live.angeline-nj.xyz/login');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Utilisateur admin existe déjà');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
NODEOF

echo ""
echo "🎉 Configuration terminée!"
echo ""
echo "📝 IDENTIFIANTS DASHBOARD:"
echo "   URL: https://live.angeline-nj.xyz/login"
echo "   Username: admin"
echo "   Password: Admin2026!"
echo ""
echo "📝 IDENTIFIANTS POSTGRESQL:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: angeline_live"
echo "   Username: angeline_admin"
echo "   Password: Angeline2026"
echo ""
