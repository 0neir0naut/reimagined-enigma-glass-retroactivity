//discord.js and leaderboard data ready
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require("fs");

module.exports = {
  name: 'reportMatch',
  description: 'Report a match to the ladder bot.',
  aliases: ['report', 'matchreport', 'match', 'reportmatch'],
  execute(message) {
    const reporter = message.author;
    console.log(`${Date.now()} New reporter: ${reporter.username}`);

    reportStats(reporter, message)
  },
}

reportStats = async (reporter, message) => {
  const client = new Discord.Client();
  /////////////////////OPPONENT
  var numWins = 0;
  var numLosses = 0;

  message.channel.send('Who was your opponent? **Be sure to @mention them.**')
    .then(function() {
      message.channel.awaitMessages(response => response.content && response.author.id === reporter.id && response.mentions.users && response.mentions.users.first() != reporter || response.mentions.users.first() == reporter && response.mentions.users.first().bot == true, {
        max: 1,
        time: 60000,
        errors: ['time'],
      })
      .then((collected) => {
        console.log(collected.first().content);
        var opponent = getUserFromMention(collected.first().content);
        console.log(opponent);
        //var opponent = collected.first().content;
        console.log(`${Date.now()} New opponent reported: ${opponent.username}`);
        console.log(opponent);
      
        //console.log(`${Date.now()} Invalid opponent reported. Exiting report.`);
        //message.channel.send('Invalid opponent reported. Exiting report.');
        //return;
        

        /////////////////////NUMBER OF WINS
        message.channel.send('How many times did you win?')
          .then(function() {
            message.channel.awaitMessages(response => response.content && response.author.id == reporter.id && Math.round(response.content) > -1 && Math.round(response.content) < 101, {
              max: 1,
              time: 60000,
              errors: ['time'],
            })
              .then((collected) => {
                const numWins = Math.round(collected.first().content);
                console.log(`${Date.now()} Number of wins for reporter: ${numWins}`);
              

                /////////////////////NUMBER OF LOSSES  
                message.channel.send('How many times did you lose?')
                  .then(function() {
                    message.channel.awaitMessages(response => response.content && response.author.id == reporter.id && Math.round(response.content) > -1 && Math.round(response.content) < 101,  
                    {
                      max: 1,
                      time: 60000,
                      errors: ['time'],
                    })
                      .then((collected) => {
                        var numLosses = Math.round(collected.first().content);
                        console.log(`${Date.now()} Number of wins for reporter: ${numLosses}`);


                        /////////////////////VERIFICATION
                        message.channel.send(`${opponent}, is this match information correct? (Yes/No).`);
                        message.channel.send(`You won ${numLosses} game and lost ${numWins} game against ${reporter.username}.`)
                          .then(function() {
                            message.channel.awaitMessages(response => response.content && response.content.toLowerCase() == "yes" && message.channel.lastMessage.author.id === opponent.id || message.channel.lastMessage.author.id == 435140371069140992, {
                              max: 1,
                              time: 12000,
                              errors: ['time'],
                            })
                              .then((collected) => {
                                console.log('Collected at verification!');
                                console.log(message.channel.lastMessage.content);
                                message.channel.send('Information confirmed. Updating leaderboard...');
                                console.log(`${Date.now()} Match report approved`);
                                updateLeaderboard(message, reporter, opponent, numWins, numLosses);
                              })
                              .catch(collected => {
                                console.log('Caught error at verification');
                              });
                          });
                      })
                      .catch(collected => {
                        console.log('Caught error at loss collect');
                      });
                  });
              })
              .catch((collected) => {
                console.log('Caught error at num wins')
              });
          })
          .catch(collected => {
            message.channel.send('No information documented');
          });
      });
    });
};

function updateLeaderboard(message, reporter, opponent, numWins, numLosses) {
  //read JSON file 
  var fs = require('fs');
  var board = require('./leaderboardData.json');
  console.log('Board before new users:');
  console.log(board);

  var reporterOnBoard = false;
  //determine if reporter is already on the board
  for (i = 0; i < board.length; i++) {
    if (reporter.username == board[i].name) {
      reporterOnBoard = true;
      console.log(`${Date.now()} ${reporter.username} already on board.`);
    }
  }

  //add them if not
  if (reporterOnBoard == false) {
    //set stats to add
    let player = {
      name: reporter.username,
      elo: 1200,
      wins: 0,
      losses: 0
    };

    //add new data to board object 
    board.push(player);

    fs.writeFile('./commands/leaderboardData.json', JSON.stringify(board, null, 2), err => {

      // Checking for errors 
      if (err) throw err;
      console.log(`${Date.now()} Added ${reporter.username} to board`);
    });
  }

  var opponentOnBoard = false;
  //determine if opponent is already on the board
  for (i = 0; i < board.length; i++) {
    if (opponent.username == board[i].name) {
      opponentOnBoard = true;
      console.log(`${Date.now()} ${opponent.username} already on board.`);
    }
  }

  if (opponentOnBoard == false) {
    //set stats to add
    let player2 = {
      name: opponent.username,
      elo: 1200,
      wins: 0,
      losses: 0
    };
    //add new data to board object 
    board.push(player2);

    //write to the file 
    fs.writeFile('./commands/leaderboardData.json', JSON.stringify(board, null, 2), err => {

      // Checking for errors 
      if (err) throw err;
      console.log(`${Date.now()} Added ${opponent.username} to board.`);
    });
  }




  //Once any new users are added if needed, begin updating elo
  //Reload board
  var fs = require('fs');
  var board = [];
  var board = require('./leaderboardData.json');

  var reporterElo = 0;
  var reporterWins = 0;
  var reporterLosses = 0;
  var opponentElo = 0;
  var opponentWins = 0;
  var opponentLosses = 0;
  var changeValue = 0;


  //Load reporter stats
  for (i = 0; i < board.length; i++) {
    if (board[i].name == reporter.username) {
      reporterElo = board[i].elo;
      reporterWins = board[i].wins;
      reporterLosses = board[i].losses;
    }
  }

  //Load opponent stats
  for (i = 0; i < board.length; i++) {
    if (board[i].name == opponent.username) {
      opponentElo = board[i].elo;
      opponentWins = board[i].wins;
      opponentLosses = board[i].losses;
    }
  }

  //Calculate total wins and losse for the leaderboard
  reporterWins = Math.round(reporterWins) + Math.round(numWins);
  reporterLosses = Math.round(reporterLosses) + Math.round(numLosses);
  opponentWins = Math.round(opponentWins) + Math.round(numLosses);
  opponentLosses = Math.round(opponentLosses) + Math.round(numWins);


  //Figure out TOTAL GAIN for reporter and TOTAL LOSS for opponent
  var winCounter = 0;
  var lossCounter = 0;
  for (i = 0; i < (numWins + numLosses); i++) {
    if (winCounter < numWins) {
      elos = calculateElo(reporterElo, opponentElo, true);
      reporterElo = elos[0];
      opponentElo = elos[1];
      winCounter = winCounter + 1;
    }
    if (lossCounter < numLosses) {
      //Add losses as going until done
      elos = calculateElo(reporterElo, opponentElo, false);
      reporterElo = elos[0];
      opponentElo = elos[1];
      lossCounter = lossCounter + 1;
    }
  }
  console.log(`${Date.now()} Reporter elo after all games: ${reporterElo}`);
  console.log(`${Date.now()} Opponent elo after all games: ${opponentElo}`);


  //Update the leaderboard with elos and wins/losses

  for (i = 0; i < board.length; i++) {
    if (reporter.username == board[i].name) {
      board[i].elo = Math.round(reporterElo);
      board[i].wins = Math.round(reporterWins);
      board[i].losses = Math.round(reporterLosses);
      console.log(board[i].wins);
    }
  }

  for (i = 0; i < board.length; i++) {
    if (opponent.username == board[i].name) {
      board[i].elo = Math.round(opponentElo);
      board[i].wins = Math.round(opponentWins);
      board[i].losses = Math.round(opponentLosses);
    }
  }

  //write to the file 
  var fs = require('fs');
  fs.writeFile("./commands/leaderboardData.json", JSON.stringify(board, null, 2), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log(`${Date.now()} Updated board:`)
    console.log(board);
  });
}


function calculateElo(reporterElo, opponentElo, reporterWinScenario) {
  var changeValue = 0;

  //Calculate new elos for each player
  var expectedResultReporter = 1 / (1 + 10 ** ((opponentElo - reporterElo) / 400));
  var expectedResultOpponent = 1 - expectedResultReporter;

  if (reporterWinScenario == true) {
    changeValue = (expectedResultOpponent * 32);
    if (changeValue < 1) {
      changeValue = 1;
    }
    reporterElo = reporterElo + changeValue;
    opponentElo = opponentElo - changeValue;
  } else if (reporterWinScenario == false) {
    if (changeValue < 1) {
      changeValue = 1;
    }
    changeValue = (expectedResultReporter * 32);
    opponentElo = opponentElo + changeValue;
    reporterElo = reporterElo - changeValue;
  }
  return [reporterElo, opponentElo];
}

function getUserFromMention(mention) {
	// The id is the first and only match found by the RegEx.
	const matches = mention.match(/^<@!?(\d+)>$/);

	// If supplied variable was not a mention, matches will be null instead of an array.
	if (!matches) return;

	// However the first element in the matches array will be the entire mention, not just the ID,
	// so use index 1.
	const id0 = matches[1];
  console.log('Matches: ');
  console.log(matches);

	return client.users.cache.get(id0);
}
