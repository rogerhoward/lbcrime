var r = require('rethinkdb');
var express = require('express');
var socketio = require('socket.io');

var app = express(), 
	server = require('http').createServer(app), 
	io = socketio().listen(server);

app.start = app.listen = function(){
  return server.listen.apply(server, arguments)
};

app.start(8090);


// app.listen(8090);
console.log("Node.js, Socket.io listening on port 8090");


// Use static serving from public directory
app.use(express.static('public'));

// Returns single incidents by ID as JSON
app.get("/incidents/:itemid", function(req, res) {
	var itemid = parseInt(req.params.itemid, 10);

	r.connect().then(function(conn) {
		return r.db("lbpd").table("incidents")
			.filter({item_id: itemid}).run(conn)
			.finally(function() { conn.close(); });
	})
	.then(function(cursor) { return cursor.toArray(); })
	.then(function(output) { res.json(output[0]); })
	.error(function(err) { res.status(500).json({err: err}); })
});


// Returns all incidents as JSON
app.get("/incidents", function(req, res) {
	r.connect().then(function(conn) {
		return r.db("lbpd").table("incidents").run(conn)
		.finally(function() { conn.close(); });
	})

	.then(function(cursor) { return cursor.toArray(); })
	.then(function(output) { res.json(output); })
	.error(function(err) { res.status(500).json({err: err}); })
});



// Save query reference to all incidents ordered by ID
var getIncidents = r.db("lbpd").table("incidents").orderBy({index: 'id'});

// Send each new incident to current lpbdupdate clients
r.connect().then(function(conn) {
	return getIncidents.changes().run(conn);
})
.then(function(cursor) {
	cursor.each(function(err, data) {
		io.sockets.emit("lbpdupdate", data);
	});
});

// Send all current incidents once to new lpbdinit clients
io.on("connection", function(socket) {
	r.connect().then(function(conn) {
		return getIncidents.run(conn);
	})
	.then(function(cursor) {
		cursor.toArray(function(err, result) {
			io.sockets.emit("lbpdinit", result);
		});
	});
});



// Schedule refresh of crime data
var ezaxess = require('./ezaxess');
ezaxess.schedule();
