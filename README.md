:point_right: As this software was first intended to be used in a French-speaking business, the following README is written in French. The whole project is currently being translated in English.

# Introduction

Ce programme est une application web qui a pour but de faciliter la gestion des tâches d'une équipe d'ouvriers et leur communication avec les différentes équipes composant une entreprise.

_Open Planner_ a été créé sur mesure pour l'ASBL belge _Centre IFAPME Liège-Huy-Verviers_, active dans le secteur de la promotion sociale.

![Page d'accueil d'_Open Planner_](https://raw.githubusercontent.com/belgianGeek/open-planner/backend-dev/screenshots/home.png)

# Prérequis

Afin de fonctionner de manière optimale, cette application nécessite les éléments suivants :

- Elle doit être installée dans un environnement de type Linux
- Un serveur de base de données [PostgreSQL](https://www.postgresql.org) en version `<= 9`
- [Node.js](https://nodejs.org) en version `<= 10`

Le serveur de base de données et la plateforme Node.js peuvent être installés très facilement depuis le gestionnaire de paquets de la distribution Linux utilisée (par exemple, sous Ubuntu/Debian via la commande `sudo apt install -y nodejs postgresql`, consultez la documentation de votre distribution si celle-ci n'est pas basée sur Debian).

# Mise en place

:point_right: Ces instructions peuvent paraître compliquées à suivre pour tout qui n'est pas familier avec le domaine de l'informatique. N'hésitez donc pas à [ouvrir une issue](https://github.com/belgianGeek/open-planner/issues/new) afin d'obtenir de l'aide.

Le logiciel _Open Planner_ peut être téléchargé et installé en quelques clics, une fois les prérequis satisfaits.

Pour télécharger le programme, vous pouvez soit cloner ce dépôt dans un dossier sur votre ordinateur (attention, cela nécessite d'avoir installé [Git](https://git-scm.com/) au préalable !) via la commande `git clone https://github.com/belgianGeek/open-planner.git /home/$user/Documents/open-planner` ou simplement télécharger l'ensemble des fichiers au format `.zip` et les déplacer ensuite dans le dossier de votre choix sur votre ordinateur.

Le serveur de base de données PostgreSQL doit être actif pour assurer le bon fonctionnement du logiciel. Pour démarrer le service, vous pouvez donc entrer la commande `sudo systemctl start postgresql` dans un terminal. Afin que le service soit démarré à chaque allumage de votre ordinateur, vous devez exécutez la commande `sudo systemctl enable postgresql`.

Pour finaliser l'installation, vous n'avez plus qu'à démarrer le programme en ouvrant une fenêtre de terminal, en vous rendant dans le dossier où vous avez placé les fichiers du programme (au moyen de la commande `cd dossier-d'open-planner`) et exécuter la commande `npm run start`. Cette comande aura pour effet d'afficher plusieurs lignes, y compris un lien vous permettant de vous connecter à l'interface et de terminer la configuration grâce à un menu d'introduction qui vous guidera étape par étape.

# Utilisation

## Principes de base

Open Planner est destiné à être utilisé dans les entreprises comptant plusieurs implantations. Il a été créé afin de faciliter la communication entre le personnel et les équipes chargées d'effectuer les travaux.

Chaque implantation est donc liée à une adresse mail, qui recevra les notifications des demandes rentrées par les utilisateurs. Cette adresse doit de préférence être celle permettant d'entrer directement en contact avec l'équipe chargée de la tâche sur l'implantation spécifiée.

## Comptes utilisateurs

Il existe 3 types de comptes, chacun ayant des droits particuliers :

- Les visiteurs peuvent entrer une demande et visualiser leur état, sans possibilité d'agir sur celles-ci. **Une fois qu'une demande est ajoutée, un visiteur ne peut pas la modifier.**
- Les utilisateurs peuvent agir sur les demandes (attribution, ajout de commentaires) et exporter l'ensemble des tâches, ce qui peut être utile à des fins statistiques ou pour rédiger un rapport par exemple.
- Les administrateurs ont tous les droits précités mais peuvent également gérer les utlisateurs, les implantations et l'ensemble des paramètres d'Open Planner (envoi de mails, autoriser les pièces jointes...).

## Export de données et sauvegarde

Il est possible d'exporter des données depuis le menu latéral, pour autant que vous ayez a minima le rôle d'utilisateur. Il est possible d'exporter des données au format CSV ou en format PostgreSQL.

Si l'option du format CSV est sélectionnée, le fichier exporté ne contiendra que les tâches et toutes les informations qui y sont liées.

Par contre, un export au format PostgreSQL contiendra l'ensemble des données de la base de données, la structure des tables... Il s'agit de l'oiption à sélectionner si vous désirez effectuer une sauvegarde complète du programme.

Dans tous les cas, une sauvegarde complète de base de données est effectuée toutes les 12 heures. Cette action équivaut à exporter manuellement les données au format PostgreSQL comme expliqué ci-dessus.

# Un problème, une question ?

N'hésitez pas à poser une question sur [Github](https://github.com/belgianGeek/open-planner/issues/new) ou à [me contacter par mail](mailto:max@maxvdw.ovh).

# Licence

Ce logiciel est mis à la disposition de tous, gratuitement et selon les termes de la licence GNU-GPL v3.
