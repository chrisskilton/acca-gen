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

if (!fs.existsSync('./injuries.json')) {
    console.log('run npm run fetch first');
    process.exit(1);
}

var games = JSON.parse(fs.readFileSync('./fixtures.json'));
var tableData = JSON.parse(fs.readFileSync('./teamData.json'));
var injuries = JSON.parse(fs.readFileSync('./injuries.json'));

var COEFFICIENTS = {
    gd: 0.1,
    injury: 0.1,
    leaguePos: 0.1,
    result: 0.1
};

function generateProbabilities(game) {
    var probs = [1.0, 1.0, 1.0];

    var homeData = tableData[game.home];
    var awayData = tableData[game.away];

    homeData.injuries = injuries[game.home] || 0;
    awayData.injuries = injuries[game.away] || 0;

    var homePos = homeData.position * COEFFICIENTS.leaguePos;
    var awayPos = awayData.position * COEFFICIENTS.leaguePos;

    //add home prob to away team and away team to home prob to make the bigger league position less favourable
    probs[0] += awayPos;
    probs[2] += homePos;

    //for each of the last 10 home team results, add coefficient to home team for a win, away team for a loss, draw for a draw
    homeData.results.forEach(function(result) {
        var indexMap = {
            w: 0,
            d: 1,
            l: 2
        };

        probs[indexMap[result]] += COEFFICIENTS.result;
    });

    //for each of the last 10 away team results, add coefficient to away team for a win, home team for a loss, draw for a draw
    awayData.results.forEach(function(result) {
        var indexMap = {
            w: 2,
            d: 1,
            l: 0
        };

        probs[indexMap[result]] += COEFFICIENTS.result;
    });

    var gd;

    if (homeData.gd > awayData.gd) {
        probs[0] += (homeData.gd - awayData.gd) * COEFFICIENTS.gd;
    } else if (awayData.gd > homeData.gd) {
        probs[2] += (homeData.gd - awayData.gd) * COEFFICIENTS.gd;
    }

    if (homeData.injuries > awayData.injuries) {
        probs[0] += (homeData.injuries - awayData.injuries) * COEFFICIENTS.injury;
    } else if (awayData.injuries > homeData.injuries) {
        probs[2] += (homeData.injuries - awayData.injuries) * COEFFICIENTS.injury;
    }

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
        game.probabilities = probabilities;

        return game;
    });
}

console.log(generatePicks());

module.exports = generatePicks;