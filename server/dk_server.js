// Nodejs modules
var static = require('node-static');
var http = require('http');
// Tell the client not to cache
var file = new static.Server('./', { cache: 0 });

// Create http server and serve static file
var server = http.createServer(function (req, res) {
  	console.log(req.url);
	
	// Check to see which page is requested
	// DK No need to specify each file name. Need to refactor
	if(req.url.indexOf('guest.js') != -1) {
		file.serveFile('/dk_guest.js', 200, {}, req, res);
	} else if(req.url.indexOf('host.js') != -1) {
		file.serveFile('/dk_host.js', 200, {}, req, res);
	} else if(req.url.indexOf('adapter.js') != -1) {
		file.serveFile('/adapter.js', 200, {}, req, res);
	} else if(req.url.indexOf('guest') != -1) {
		file.serveFile('/dk_guest.html', 200, {}, req, res);
	} else if(req.url.indexOf('host') != -1) {
		file.serveFile('/dk_host.html', 200, {}, req, res);
	} else {
		file.serve(req, res);
	}
	
}).listen(2013);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Variable
var numHost = 0;
var numGuest = 0;

var host;
var guest;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create socket server and listen for event
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket){

	// Handle Guest
	socket.on('guest_register', function (msg) {
		handleGuestRegister(socket, msg);
	});

	socket.on('guest_message', function (msg) {
		handleGuestMessage(socket, msg);
	});

	
	// Hanlde host
	socket.on('host_register', function (msg) {
		handleHostRegister(socket, msg);
	});

	socket.on('host_message', function (msg) {
		handleHostMessage(socket, msg);
	});
	
	// Common
	socket.on('disconnect', function (msg) {
		handle_socket_disconnect(socket, msg);
	});

});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Socket event handler
function handleGuestRegister(socket, msg) {
	socket.role = 'guest';
	numGuest++;
	
	var msg = {res:200};
	socket.emit('server_guest_register', msg);
	
	guest = socket;
	
	// Notify host about new guest
	host.emit('server_host_notify', socket.id);
}

function handleGuestMessage(socket, msg) {
	// send msg to appropriate host
	host.emit('server_host_message', msg);
}

function handleHostRegister(socket, msg) {
	socket.role = 'host';
	numHost++;
	
	var msg = {res:200};
	socket.emit('server_host_register', msg);
	
	host = socket;
}

function handleHostMessage(socket, msg) {
	// send msg to appropriate guest
	guest.emit('server_guest_message', msg);
}

function handleSocketDisconnect(socket, msg) {
	
}