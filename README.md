# Discord-Monopoly
This is my Documatic Hackathon submission, for the Topic: Discord Games.

The Theme is MONOPOLY, and yes idk if it's copyright-allowed or not, I won't make it an public Bot, no worries, it's just for the competition.

Following repos I am using, which are not nodejs included:
- discord.js # For connecting to discord
- inquirer # For Command Line Select Menus

Following Repos I am using, **INCLUDED** in nodejs
- fs # Filesystem
- crypto

# USAGE:
- Download the .exe / Linux / macOS File
- Execute it
- Paste a Token, it will create a file called config.json with it in it 
- Then pick start & Deploy (or just start, if you deployed before)
- The Bot will be online and useable

# Preperation (ONLY NEEDED IF YOU WANT TO USE THE SOURCE CODE)

 - Install [nodejs](https://nodejs.org) v16 or higher
 
# Installation

```
git clone https://github.com/Tomato6966/Discord-Monopoly
cd ./Discord-Monopoly
npm install
node .
```

# Usage:
Normal start with the select menu:
```
node .
```
Auto-Host without Picking options:
```
node . host
```
Auto-Deploy without Picking deploy:
```
node . deploy
```
Auto-Host without Picking options + Deploy:
```
node . deploy host
```

pm2 Host Command:
```
pm2 start index.js --name Monpoly_Discord_Bot -- host
```


Bugs:

Due to time sakes, many features are unfinished and might be buggy at the time.
But I still think, I did good for coding 6hours on that project!

Buying houses also works!
![image](https://user-images.githubusercontent.com/68145571/169716916-86a168b2-a259-4b4b-a9ae-cde0eb4f5de7.png)
