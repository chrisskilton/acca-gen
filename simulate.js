var async = require('async');
var generate = require('./generate-picks');
var fs = require('fs');

if (!fs.existsSync('./results.json')) {
    console.log('run node fetch-results.js');
    process.exit(1);
}

var results = JSON.parse(fs.readFileSync('./results.json'));
var pickCache = [];

function genPick(callback) {
  var pick = generate();
  var pickString = JSON.stringify(pick);

  if (pickCache.indexOf(pickString) !== -1) {
    return process.nextTick(genPick.bind(null, callback));
  }

  pickCache.push(pickString);

  callback(pick);
}

function findWinner(currentCount, callback) {
    genPick(function(picks) {
      var winner = true;
      var count;

      count = currentCount === undefined ? 0 : currentCount;

      count++;

      results.forEach(function(match) {
          var pickMatch = picks.filter(function(pick) {
              return pick.home === match.home;
          })[0];

          if (!pickMatch) {
              console.log('missing result');
              return;
          }

          if (pickMatch.result !== match.result) {
              winner = false;
          }
      });

      if (!winner) {
          return process.nextTick(findWinner.bind(null, count, callback));
      }

      pickCache = [];
      callback(count);
    });
}

var sampleSize = 10;
var funcs = [];

for (var i = 0; i < sampleSize; i++) {
    funcs.push(function(done) {
      findWinner(undefined, done.bind(null, null));
    });
}

async.series(funcs, function(err, results) {
  var average = results.reduce(function(memo, num) {
      memo += num;

      return memo;
  }, 0) / sampleSize;

  console.log(average, 'average');
  console.log(Math.max.apply(null, results), 'max');
  console.log(Math.min.apply(null, results), 'min');
});
