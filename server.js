var sockio = require("socket.io");
var app = require("express")();
var r = require("rethinkdb");

app.listen(8090);
console.log("Node.js listening on port 8090");

// Serves up default HTML file
app.get('/', function(req, res){
  res.sendfile('index.html');
});

// Returns single incidents by ID
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


// Returns all incidents
app.get("/incidents", function(req, res) {
	r.connect().then(function(conn) {
		return r.db("lbpd").table("incidents").run(conn)
		.finally(function() { conn.close(); });
	})

	.then(function(cursor) { return cursor.toArray(); })
	.then(function(output) { res.json(output); })
	.error(function(err) { res.status(500).json({err: err}); })
});


var io = sockio.listen(app.listen(8091), {log: false});
console.log("Socket.io listening on port 8091");

var getIncidents = r.db("lbpd").table("incidents").orderBy({index: 'id'}).limit(5);

r.connect().then(function(conn) {
	return getIncidents.changes().run(conn);
})
.then(function(cursor) {
	cursor.each(function(err, data) {
		io.sockets.emit("update", data);
	});
});

io.on("connection", function(socket) {
  r.connect().then(function(conn) {
    return getIncidents.run(conn)
      .finally(function() { conn.close(); });
  })
  .then(function(output) { socket.emit("incidents", output); });
});

