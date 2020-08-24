module.exports = {
  name: 'leaderboard',
  description: 'Display the leaderboard.',
  aliases: ['ladder', 'board'],
  execute(message) {
    //discord.js and leaderboard data ready
    const Discord = require('discord.js');
    var leaderboardData = require('./leaderboardData.json');
    const emojiCharacters = require('./emojiCharacters.js');

    //Sort array of player names and find proper  spacing
    var playerNames = []
    for (i = 0; i < leaderboardData.length; i++) {
      playerNames.push(leaderboardData[i].name)
    }

    var sortedPlayerNames = playerNames.sort(function(a, b) { return b.length - a.length })
    var longest = sortedPlayerNames[0]

    //Refresh leaderboard
    //Get top bar ready
    boardContent = "Rank--Name"
    var numSpacesToBeAdded = longest.length - boardContent.length + 6;
    for (j = 0; j < numSpacesToBeAdded; j++) {
      boardContent = boardContent.concat('-')
    }
    boardContent = boardContent.concat('---');
    boardContent = boardContent.concat('Elo---Win/Loss');
    boardContent = boardContent.concat('\n');
    boardContent = ('**' + boardContent + '**');

    //Sort leaderboard data by elo 
    leaderboardData.sort((a, b) => parseFloat(b.elo) - parseFloat(a.elo));
    
    //Add lines for each user
    for (i = 0; i < leaderboardData.length; i++) {
      //Find proper medal/place for user line
      var place = "a";
      if(i == leaderboardData.length - 1){
        place = ':poop:';
      } else if(i == 0){
        place = emojiCharacters.a;
      } else if (i == 1){
        place = emojiCharacters.b;
      } else if (i == 2){
        place = emojiCharacters.c;
      } else if (i > 2 && i < 10){
        place = emojiCharacters[i + 1];
      } else {
        var place0 = i + 1;
        place = place0;
      }
      boardContent = boardContent.concat(place + '---');
      boardContent = boardContent.concat(leaderboardData[i].name);
      var numSpacesToBeAdded = longest.length - leaderboardData[i].name.length;
      for (j = 0; j < numSpacesToBeAdded; j++) {
        boardContent = boardContent.concat('-');
      }
      boardContent = boardContent.concat('---');
      boardContent = boardContent.concat(leaderboardData[i].elo + '---' + leaderboardData[i].wins + '/' + leaderboardData[i].losses);
      boardContent = boardContent.concat('\n');
    }
    const exampleEmbed = new Discord.MessageEmbed()
      .setDescription(boardContent)
      .setColor('#f2a807')
      .setTitle('Stick Empires Ladder')

      .setThumbnail('https://i.imgur.com/v79eCEy.png')

      .setFooter('Use *help for information on commands, including how to report a match')

    message.channel.send(exampleEmbed);
  },
};
