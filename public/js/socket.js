
console.log('socket init begin');

var host = window.location.hostname; 
var socket_url = 'http://' + host + ':8091';
var socket = io.connect(socket_url);
 
socket.on("lbpdinit", function(data) {
	$.each( data, function( index, value ){
		console.log('init', value);
		itemHandler(value);
	});
});

socket.on("lbpdupdate", function(data) {
	console.log('update', data);
	if data.old_val is null {
		console.log('added new incident!');
		itemHandler(data.new_val);
	} else {
		console.log('deleted or updated - ignoring for now!');
	}
});

console.log('socket init end');