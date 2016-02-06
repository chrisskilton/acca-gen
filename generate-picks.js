var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

if (!fs.existsSync('./fixtures.json')) {
    console.log('run node fetch.js first');
    process.exit(1);
}

var games = JSON.parse(fs.readFileSync('./fixtures.json'));

function generatePicks() {
    return games.map(function(game) {
        var thresholdToResult = ['H', 'D', 'A'];
        var randomChoice = thresholdToResult[Math.floor(Math.random() * 3)];

        game.result = randomChoice;

        return game;
    });
}

module.exports = generatePicks;