
console.log('socket init begin');

var host = window.location.hostname; 
var socket = io.connect();
 
socket.on("lbpdinit", function(data) {
	$.each( data, function( index, value ){
		console.log('init', value);
		itemHandler(value);
	});
});

socket.on("lbpdupdate", function(data) {
	console.log('update', data);
	itemHandler(data.new_val);
});

console.log('socket init end');