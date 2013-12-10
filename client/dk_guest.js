'use strict';
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Init buttons and set click event
var btRegister = document.getElementById("btRegister");
var btSend = document.getElementById("btSend");

var taSend = document.getElementById("taSend");
var taReceive = document.getElementById("taReceive");

btRegister.onclick = serverRegister;
btSend.onclick = channelSend;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Variable
var channel;
var pc;

var pc_config = webrtcDetectedBrowser === 'firefox' ?
  {'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
  {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = {
  'optional': [
    {'DtlsSrtpKeyAgreement': true},
    {'RtpDataChannels': true}
  ]};

  
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Setup socket io and connect to server
var socket = io.connect('http://localhost:2013');
 
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Public method to work with server
function serverRegister() {
	var msg = {data:'hello world'};
	socket.emit('guest_register', msg);	
}

function serverDisconnect() {
	socket.disconnect();
}

function serverSend(msg) {
	socket.emit('guest_message', msg);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Socket event
socket.on('connect', function(msg) {
	handleConnect(socket, msg);
});

socket.on('disconnect', function(msg) {
	handleDisconnect(socket, msg);
});

socket.on('server_guest_register', function(msg) {
	handleServerGuestRegister(socket, msg);
});

socket.on('server_guest_message', function(msg) {
	handleServerGuestMessage(socket, msg);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Socket event handler
function handleConnect(socket, msg) {
	console.log('connect');
}

function handleDisconnect(socket, msg) {
	console.log('disconnect');
}

function handleServerGuestRegister(socket, msg) {
	console.log('server_guest_register');
	if(msg.res == 200) {
		// Start webrtc
		startWebRTC();	
	}
}

function handleServerGuestMessage(socket, msg) {
	console.log('server_guest_message');
	
	if(msg.type && msg.type == 'sdp') {
		pc.setRemoteDescription(new RTCSessionDescription(msg.data));
		pc.createAnswer(gotDescription);
	} else if(msg.type && msg.type == 'candidate') {
		pc.addIceCandidate(new RTCIceCandidate(msg.data));
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WebRTC method
function startWebRTC() {
	var reliable = {reliable:false};
	
	pc = new RTCPeerConnection(pc_config, pc_constraints);
	pc.onicecandidate = iceCallback;
	pc.ondatachannel = gotChannel;
}

function gotDescription(desc) {
	pc.setLocalDescription(desc);
	// send to server
	var msg = {type:'sdp', data:desc};
	serverSend(msg);
}

function iceCallback(e) {
	if(e.candidate) {
		// send to server
		var msg = {type:'candidate', data:e.candidate};
		serverSend(msg);
	}
}

function gotChannel(e) {
	channel = e.channel;
	channel.onmessage = handleChannelMessage;
	channel.onopen = handleChannelStateChanged;
	channel.onclose = handleChannelStateChanged;
	trace('gotChannel2: ' + e.channel);
}

function handleChannelStateChanged() {
	var readyState = channel.readyState;
  	trace('Receive channel state is: ' + readyState);
	if(readyState == 'open') {
		
	} else {
		
	}
}

// Receive msg from other peer
function handleChannelMessage(msg) {
	// Show msg on textview
	taReceive.value = msg.data;
}

// Send msg to other peer
function channelSend() {
	var msg = taSend.value;
	channel.send(msg);	
}