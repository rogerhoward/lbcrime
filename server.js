var app = require("express")();
var r = require("rethinkdb");

app.listen(8090);
console.log("App listening on port 8090");



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