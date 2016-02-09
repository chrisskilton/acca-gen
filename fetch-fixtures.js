var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

console.log('Fetching games...');
request.get('http://www.bbc.co.uk/sport/football/fixtures/partial/competition-118996114', function(error, response, html) {
    var $ = cheerio.load(html);

    var prem = $('.table-stats').eq(0);
    var games = [];

    prem.find('tbody tr').each(function(i, el) {
        var homeTeam = $(this).find('.team-home').text().trim();
        var awayTeam = $(this).find('.team-away').text().trim();
        var kickoff = $(this).find('.kickoff').text().trim();

        games.push({
            home: homeTeam,
            away: awayTeam
        });
    });

    fs.writeFileSync('fixtures.json', JSON.stringify(games));
    console.log('fixtures written to fixtures.json');
});

