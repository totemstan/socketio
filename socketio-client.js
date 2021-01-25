var
	ioSocket = null,
	ioChannels = {};

function io(url) {	//< make a connect request to the server at url||window.location

	//console.log("ws connect", url, ioClient);

	ioSocket = new WebSocket( (url || "ws://localhost:8080" || window.location ).replace("http:","ws:") );
	ioSocket.on = (channel,cb) => {
		console.log("set cb:", channel);
		ioChannels[channel] = cb;
	};

	ioSocket.emit = (channel,req) => { //< emit req over channel
		console.log( ">>"+channel, req);

		// Create a web scoket, send the req over the channel, then listen for optional ack.

		const emitSocket = new WebSocket( (url || "ws://localhost:8080" || window.location ).replace("http:","ws:") );

		emitSocket.addEventListener('open', () => {
			// Send a message to the WebSocket server
			emitSocket.send( JSON.stringify({		// Send a message to the WebSocket server
				channel: channel,
				message: req,
				id: ioClient
			}) );
		});  

		if (0) 	// can listen for an acknowlegement sent by the server
		emitSocket.addEventListener('message', event => {
			// The `event` object is a typical DOM event object, and the message data sent
			// by the server is stored in the `data` property
			console.log('emit Received:', event.data);
		});
	};					

	// Send a connect message and optionally listen for the ack
	console.log(">>connect");
	ioSocket.addEventListener('open', () => {
		// Send a message to the WebSocket server
		ioSocket.send( JSON.stringify({		// Send a message to the WebSocket server
			channel: "connect",
			message: "a request to connect",
			id: ioClient
		}) );
	});  

	if (0)	// listen for the ack
	ioSocket.addEventListener('message', event => {
		// The `event` object is a typical DOM event object, and the message data sent
		// by the server is stored in the `data` property
		console.log('Received:', event.data);
	});

	ioSocket.addEventListener('message', event => {
		console.log("cb rx", event.data );
		try {
			const
				{channel,message,id} = JSON.parse(event.data),
				cb = ioChannels[channel];

			if ( cb ) 
				cb( message );

			else
				onsole.log( `socketio received json on undefined channel ${channel}`, event.data);
		}

		catch (err) {
			console.log( `socketio received invalid json on channel ${channel}`, event.data);
		}
	});

	return ioSocket;
}