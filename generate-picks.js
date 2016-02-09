var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

if (!fs.existsSync('./fixtures.json')) {
    console.log('run npm run fetch first');
    process.exit(1);
}

if (!fs.existsSync('./teamData.json')) {
    console.log('run npm run fetch first');
    process.exit(1);
}

var games = JSON.parse(fs.readFileSync('./fixtures.json'));
var tableData = JSON.parse(fs.readFileSync('./teamData.json'));

function generateProbabilities(game) {
    var probs = [1.0, 1.0, 1.0];

    var homeData = tableData[game.home];
    var awayData = tableData[game.away];

    var homePos = (homeData.position * 5) / 100;
    var awayPos = (awayData.position * 5) / 100;

    //add home prob to away team and away team to home prob to make the bigger league position less favourable
    probs[0] += awayPos;
    probs[2] += homePos;

    homeData.results.forEach(function(result) {
        var indexMap = {
            w: 0,
            d: 1,
            l: 2
        };

        probs[indexMap[result]] += 0.1;
    });

    probs = probs.map(function(prob) {
        return +prob.toFixed(2);
    });

    return probs;
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function pickResult(probabilities) {
    var totalWeight = probabilities.reduce(function (memo, prob) {
        memo += prob;

        return memo;
    }, 0);
    var randomNumber = rand(0, totalWeight);
    var weightSum = 0;
    var outcomes = ['H', 'D', 'A'];

    for (var i = 0; i < outcomes.length; i ++) {
        weightSum += probabilities[i];
        weightSum = +weightSum.toFixed(2);

        if (randomNumber <= weightSum) {
            outcome = outcomes[i];
            break;
        }
    }

    return outcome;
}

function generatePicks() {
    return games.map(function(game) {
        var probabilities = generateProbabilities(game);
        var choice = pickResult(probabilities);

        game.result = choice;

        return game;
    });
}

console.log(generatePicks());

module.exports = generatePicks;