var generate = require('./generate-picks');
var winners = [
  { home: 'Tottenham', away: 'Watford', result: 'H' },
  { home: 'Southampton', away: 'West Ham', result: 'H' },
  { home: 'Aston Villa', away: 'Norwich', result: 'H' },
  { home: 'Liverpool', away: 'Sunderland', result: 'D' },
  { home: 'Newcastle', away: 'West Brom', result: 'H' },
  { home: 'Stoke', away: 'Everton', result: 'A' }
  ];

var pickCache = [];

function genPick() {
  var pick = generate();
  var pickString = JSON.stringify(pick);

  if (pickCache.indexOf(pickString) !== -1) {
    console.log('duplicate', pickCache.length);
    return genPick();
  }

  pickCache.push(pickString);

  console.log('not a duplicate')
  return pick;
}

function findWinner(currentCount) {
    var picks = genPick();
    var winner = true;
    var count;

    count = currentCount === undefined ? 0 : currentCount;

    count++;

    winners.forEach(function(match) {
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
        return findWinner(count);
    }

    return count;
}

var results = [];
var sampleSize = 100;

for (var i = 0; i < sampleSize; i++) {
    results.push(findWinner());
}

var average = results.reduce(function(memo, num) {
    memo += num;

    return memo;
}, 0) / sampleSize;

console.log(average, 'average');
console.log(Math.max.apply(null, results), 'max');
console.log(Math.min.apply(null, results), 'min');
