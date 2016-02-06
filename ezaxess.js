// ezaxess.js
// ========

var schedule = require('node-schedule'); 
var http = require('http');

var r = require('rethinkdb');
var connection = null;
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;
})

module.exports = {
	schedule: function () {
		console.log('scheduling ezaxess job now...');

		// sync();
		
		var job = schedule.scheduleJob('*/1 * * * *', function() {
			sync();
		});
	}
};


var parseAndIngest = function (xmldata) {
	var parseString = require('xml2js').parseString;
	parseString(xmldata, function (err, result) {
		console.log('about to map');
	    incidents = result.data.item.map(rePackage);
	});

	// console.log(inserts);

	r.db('lbpd').table('incidents').insert(incidents, {conflict: "update"} ).run(connection, function(err, result) {
	    if (err) throw err;
	    console.log(JSON.stringify(result, null, 2));
	})

}

var rePackage = function (e) {
	incident = {};

	incident.id = int(e.id[0]);
	incident.item_id = int(e.id[0]);
	incident.case_id = int(e.case_number[0]);
	incident.incident_id = int(e.incident_id[0]);

	incident.title = e.title[0].trim();
	incident.description = e.description[0].trim();
	incident.time = new Date(e.date_occured[0]);

	incident.address = e.block_address[0].trim();
	incident.city = e.city[0].trim();
	incident.state = e.state[0].trim();

	incident.latitude = parseFloat(e.latitude[0].trim());
	incident.longitude = parseFloat(e.longitude[0].trim());

	incident.location = r.point(incident.longitude, incident.latitude);

	// console.log(incident);
	return incident;
}



var sync = function () {
	console.log('job running...');
	get('http://api.ezaxess.com/v2/pd/longbeach/crimes/all', parseAndIngest)
}



function getstub(url, callback) {
	var body = "<data><item><id>2375503</id><case_number>160006884</case_number></item></data>";	
	callback(body);
}



function get(url, callback) {
	var request = require('request');
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(body);
		}
	})
}



var int = function (str) {
	return parseInt(str, 10);
}
