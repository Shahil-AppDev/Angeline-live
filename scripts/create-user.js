#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createUser() {
  console.log('\n🔐 Création d\'un nouvel utilisateur admin\n');

  const username = await question('Nom d\'utilisateur: ');
  const password = await question('Mot de passe: ');

  if (!username || !password) {
    console.error('❌ Le nom d\'utilisateur et le mot de passe sont requis');
    rl.close();
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Le mot de passe doit contenir au moins 6 caractères');
    rl.close();
    process.exit(1);
  }

  console.log('\n⏳ Génération du hash...');
  const hash = bcrypt.hashSync(password, 10);

  console.log('\n✅ Hash généré avec succès!\n');
  console.log('📝 Ajoute ces lignes dans ton fichier .env:\n');
  console.log(`ADMIN_USERNAME=${username}`);
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('\n💡 Remplace les anciennes valeurs ADMIN_USERNAME et ADMIN_PASSWORD_HASH\n');

  rl.close();
}

createUser().catch(err => {
  console.error('❌ Erreur:', err.message);
  rl.close();
  process.exit(1);
});
