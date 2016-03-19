var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

console.log('Fetching league table...');
request.get('http://www.bbc.co.uk/sport/football/tables/partial/118996114', function(error, response, html) {
    var $ = cheerio.load(html);

    var prem = $('.table-stats').eq(0);
    var teamData = {};

    prem.find('tbody tr').each(function(i, el) {
        var team = $(this).find('.team-name').text().trim();
        var position = parseInt($(this).find('.position-number').text().trim(), 10);
        var lastTenGames = $(this).find('.last-10-games ol li span');
        var gd = parseInt($(this).find('.goal-difference'), 10);

        var results = [];

        lastTenGames.each(function(i, el) {
            results.push($(this).text().substring(0, 1).toLowerCase());
        });

        teamData[team] = {
            position: position,
            results: results,
            gd: gd
        };
    });

    fs.writeFileSync('teamData.json', JSON.stringify(teamData));
    console.log('team data written to teamData.json');
});

