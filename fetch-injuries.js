var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var nameMap = require('./site-team-name-map');

console.log('Fetching injuries...');
request.get('http://www.physioroom.com/news/english_premier_league/epl_injury_table.php', function(error, response, html) {
    var $ = cheerio.load(html);

    var table = $('#epl-table-top');
    var teamInjuryMap = {};

    table.find('tbody tr').each(function(i, el) {
        var team = $(this).find('td').eq(1).text().trim();
        var injuryCount = parseInt($(this).find('td').eq(2).text().trim(), 0);
        var name = nameMap[team] || team;

        teamInjuryMap[name] = injuryCount;
    });

    fs.writeFileSync('injuries.json', JSON.stringify(teamInjuryMap));
    console.log('injuries written to injuries.json');
});

