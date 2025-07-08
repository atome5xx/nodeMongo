
## Prérequis

- [Node.js](https://nodejs.org/) (version 20.x recommandée)
- [MongoDB](https://www.mongodb.com/) (en local ou via Atlas)

## Installation

npm install

## Lancement

npm start

## Lien vers l'appli

http://localhost:3000/



1) Créer le fichier main.tf 



2) Commandes terraform :

terraform init  
terraform validate
terraform plan    
terraform apply   


3) Puis on va dans le terminal :     

http://<ip_publique_de_la_VM>:3000/



http://52.143.148.86:3000/




Optionnels : 


3) Dans le terminal : ssh admin_sd@<ip_publique_de_la_VM>

4) mdp : ChangeMe1234!


Si bug de lancement de projet, dans le terminal linux : 


cd nodeapp

nohup node index.js >> app.log 2>&1 &


