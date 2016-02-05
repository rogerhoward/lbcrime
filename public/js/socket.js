
console.log('socket init begin');

var socket = io.connect();
 
socket.on("lbpdinit", function(data) {
  console.log('init', data);
});
 
socket.on("lbpdupdate", function(data) {
  console.log('update', data);
});


console.log('socket init end');