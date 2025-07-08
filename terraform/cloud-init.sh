#!/bin/bash
# Mise à jour système
apt update -y
apt upgrade -y

# Installer curl (si absent)
apt install -y curl

# Installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git

# Installer MongoDB officiel (version 6.x stable pour Ubuntu 20.04)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# Activer et démarrer MongoDB
systemctl enable mongod
systemctl start mongod



# Cloner ton projet
cd /home/admin_sd
git clone https://github.com/atome5xx/nodeMongo nodeapp
cd nodeapp

# S’assurer que le dossier appartient à l’utilisateur
chown -R admin_sd:admin_sd /home/admin_sd/nodeapp

# Installer dépendances
npm install

# Créer ou vider le fichier app.log avec les bons droits
: > app.log
chmod 664 app.log
chown admin_sd:admin_sd app.log

# Lancer l’app en arrière-plan avec nohup (avec index.js)
nohup node index.js >> app.log 2>&1 &

# Afficher les versions installées
echo "Versions installées :"
node -v
npm -v
mongod --version







