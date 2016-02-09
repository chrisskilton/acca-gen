var generate = require('./generate-picks');
var winners = [
  { home: 'Sunderland', away: 'Man Utd', result: 'H' },
  { home: 'Bournemouth', away: 'Stoke', result: 'A' },
  { home: 'Crystal Palace', away: 'Watford', result: 'H' },
  { home: 'Everton', away: 'West Brom', result: 'D' },
  { home: 'Swansea', away: 'Southampton', result: 'H' },
  { home: 'Chelsea', away: 'Newcastle', result: 'H' }
  ];

function findWinner(currentCount, callback) {
    var picks = generate();
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
        return process.nextTick(findWinner.bind(null, count, callback));
    }

    //console.log(count, 'tickets generated to find winner');
    callback(count);
}

var results = [];
var sampleSize = 100;

for (var i = 0; i < sampleSize; i++) {
    findWinner(undefined, function(count) {
        results.push(count);

        if (results.length !== sampleSize) {
            return;
        }

        var average = results.reduce(function(memo, num) {
            memo += num;

            return memo;
        }, 0) / sampleSize;

        console.log(average, 'average');
    });
}
