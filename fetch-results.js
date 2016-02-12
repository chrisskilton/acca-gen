var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var moment = require('moment');
var minimist = require('minimist');

var args = minimist(process.argv.slice(2));

var matchDay = args.date;

if (!matchDay) {
    console.log('must suppliy --date YYYY-MM-DD');
    process.exit(1);
}

function parseResult(score) {
    var scores = score.split('-');
    var home = parseInt(scores[0], 10);
    var away = parseInt(scores[1], 10);

    if (home > away) {
        return 'H';
    } else if (away > home) {
        return 'A';
    }

    return 'D';
}

function parseDate(tableDate) {
    var parts = tableDate.split(' ');
    parts = parts.slice(parts.length -3);

    var day = parts[0];

    parts[0] = day.substring(0, day.length -2);

    return moment(new Date(parts.join(' '))).format('YYYY-MM-DD');
}

console.log('Fetching results...');
request.get('http://www.bbc.co.uk/sport/football/results/partial/competition-118996114', function(error, response, html) {
    var $ = cheerio.load(html);

    var prem = $('.table-stats').filter(function() {
        return parseDate($(this).find('caption').text()) === matchDay;
    });

    var results = [];

    prem.find('tbody tr').each(function(i, el) {
        var homeTeam = $(this).find('.team-home').text().trim();
        var awayTeam = $(this).find('.team-away').text().trim();
        var result = parseResult($(this).find('.score').text());

        results.push({
            home: homeTeam,
            away: awayTeam,
            result: result
        });
    });

    fs.writeFileSync('results.json', JSON.stringify(results));
    console.log('results written to results.json');
});

