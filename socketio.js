/**
	[SOCKETIO](https://github.com/totemstan/socketio.git) replaces buggy socket.io and socket.io-client

	ref: https://medium.com/hackernoon/implementing-a-websocket-server-with-node-js-d9b78ec5ffa8	

	@requires CRYPTO

*/

const
	CRYPTO = require("crypto"),	
	Log = (...args) => console.log(">>>socketio",args),
	Each = ( A, cb ) => {
		Object.keys(A).forEach( key => cb( key, A[key] ) );
	};

module.exports = function SIO(server) {			// the good socketio
	const
		{ cbs, send, clients } = sio = {
			cbs: {			// stash for listeners
			},
			
			clients: {},	// stash for connected clients
			
			on: (channel,cb) => {			//< attach cb(req) listener on specified socketio channel
				Log("set cb",channel,cb?true:false);
				cbs[channel] = cb;
			},
			
			emit: (channel,req) => {		//< broadcast req on socketio channel to all connected clients
				Each( clients, (id,socket) => {
					Log("allemit to client", id, channel, req);
					send( socket, {
						channel: channel,
						message: req,
						id: id
					});
				});
			},
			
			send: ( socket, req ) => {		//< send req to client at specified socket
				function constructReply (data) {
					// Convert the data to JSON and copy it into a buffer
					const json = JSON.stringify(data)
					const jsonByteLength = Buffer.byteLength(json);
					
					// Note: we're not supporting > 65535 byte payloads at this stage 
					const lengthByteCount = jsonByteLength < 126 ? 0 : 2; 
					const payloadLength = lengthByteCount === 0 ? jsonByteLength : 126; 
					const buffer = Buffer.alloc(2 + lengthByteCount + jsonByteLength); 
					
					// Write out the first byte, using opcode `1` to indicate that the message 
					// payload contains text data 
					buffer.writeUInt8(0b10000001, 0); 
					buffer.writeUInt8(payloadLength, 1); 
					
					// Write the length of the JSON payload to the second byte 
					let payloadOffset = 2; 
					if (lengthByteCount > 0) { 
						buffer.writeUInt16BE(jsonByteLength, 2); payloadOffset += lengthByteCount; 
					} 
					
					// Write the JSON data to the data buffer 
					buffer.write(json, payloadOffset); 
					return buffer;
				}

				socket.write( constructReply(req) ); 
			},

			path: () => "**** The good socketio of the west ****"
		};

	server.on('upgrade', (req, socket) => {	// intercept socketio request

		const
			ack = "";
		
		function generateAcceptValue (acceptKey) {
			return CRYPTO
				.createHash('sha1')
				.update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
				.digest('base64');
		}

		// Read the websocket keys provided by the client
		
		const 
			acceptKey = req.headers['sec-websocket-key'],
			requestSocket = req.headers['upgrade'],
			requestProtocol = req.headers["Sec-WebSocket-Protocol"];
		
		// if the client has requested use of a subprotocol but hasn’t provided any that the server is able 
		// to support, the server must send a failure response and close the connection
		// IANA registry for Websocket Subprotocol Names
		// https://www.iana.org/assignments/websocket/websocket.xml
		// includes soap, xmpp, wamp, mqtt

		if ( requestSocket !== 'websocket') {
			socket.end('HTTP/1.1 400 Bad Request');
			return null;
		}
		
		const 
			hash = generateAcceptValue(acceptKey), 			// Generate the response value to use in the response
			responseHeaders = [ 							// Write the HTTP response into an array of response lines
				'HTTP/1.1 101 Web Socket Protocol Handshake', 
				'Upgrade: WebSocket', 
				'Connection: Upgrade', 
				`Sec-WebSocket-Accept: ${hash}`,
				// `Sec-WebSocket-Protocol: json`	// cant set header on wss socket
			]; 

		// Write the response back to the client socket, being sure to append two 
		// additional newlines so that the browser recognises the end of the response 
		// header and doesn't continue to wait for more header data: 
		
		socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');

		socket.on("data", d => {
			function parseRFC5234buffer (buffer) {

				function getOpCode() {
					const 
						firstByte = buffer.readUInt8(0),
						isFinalFrame = Boolean((firstByte >>> 7) & 0x1),
						[reserved1, reserved2, reserved3] = [ 
							Boolean((firstByte >>> 6) & 0x1), 
							Boolean((firstByte >>> 5) & 0x1), 
							Boolean((firstByte >>> 4) & 0x1) ],
						opCode = firstByte & 0xF; 

					return opCode;
				}

				function getText() {
					const 
						secondByte = buffer.readUInt8(1),
						isMasked = Boolean((secondByte >>> 7) & 0x1); 

					// Keep track of our current position as we advance through the buffer 
					let 
						currentOffset = 2,
						payloadLength = secondByte & 0x7F; 

					if (payloadLength > 125) { 
						if (payloadLength === 126) { 
							payloadLength = buffer.readUInt16BE(currentOffset); 
							currentOffset += 2; 
						} 

						else { 
							// 127 
							// If this has a value, the frame size is ridiculously huge! 
							const leftPart = buffer.readUInt32BE(currentOffset); 
							const rightPart = buffer.readUInt32BE(currentOffset += 4); 
							// Honestly, if the frame length requires 64 bits, you're probably doing it wrong. 
							// In Node.js you'll require the BigInt type, or a special library to handle this. 
							throw new Error('Large payloads not currently implemented'); 
						} 
					}

					// Allocate somewhere to store the final message data
					const data = Buffer.alloc(payloadLength);

					if ( isMasked ) {	// browser always sends masked data
						let maskingKey;
						maskingKey = buffer.readUInt32BE(currentOffset);
						currentOffset += 4;

						// Loop through the source buffer one byte at a time, keeping track of which
						// byte in the masking key to use in the next XOR calculation
						for (let i = 0, j = 0; i < payloadLength; ++i, j = i % 4) {
							// Extract the correct byte mask from the masking key
							const shift = j == 3 ? 0 : (3 - j) << 3; 
							const mask = (shift == 0 ? maskingKey : (maskingKey >>> shift)) & 0xFF;
							// Read a byte from the source buffer 
							const source = buffer.readUInt8(currentOffset++); 
							// XOR the source byte and write the result to the data 
							data.writeUInt8(mask ^ source, i); 
						}
					}

					else {
						buffer.copy(data, 0, currentOffset++);
					}

					return data.toString('utf8');
				}

				switch ( opCode = getOpCode() ) {
					case 0x0:	// denotes a continuation frame
					case 0x2: 	// denotes a binary frame
					case 0x3:
					case 0x4:
					case 0x5:
					case 0x6:
					case 0x7: 	// reserved for further non-control frames
					case 0x8: 		// denotes a connection close
						return null;  	// signal end of frame

					case 0x9:	// denotes a ping
					case 0xA:	// denotes a pong
					case 0xB:
					case 0xC:
					case 0xD:
					case 0xE:
					case 0xF:	// reserved for further control frames
						return null;									

					case 0x1: 	// denotes a text frame
						return getText();
				}
			}

			//Log(d);
			try {
				const
					ctrl = parseRFC5234buffer(d);
				
				//Log("ctrl packet",ctrl);
				if ( ctrl ) {		// client's new WebSocket() creates a null ctrl
					const 
						{channel,message,id} = JSON.parse( ctrl );

					if (0)
					Log("ctrl packet", {
						chan: channel,  
						msg: message,
						id: id,
						chanOK: channel in cbs
					});  

					if ( cb = cbs[channel] ) {
						switch (channel) {
							// trap socketio-reserved channels.
								
							case "disconnect":
							case "exit":
							case "timeout":
							case "readable":
							case "end":
							case "data":
								Log("closing socket for", channel, message, id);
								socket.end();
								break;
								
							case "connect":
								
								clients[id] = socket;
								
								socket.on = (channel,cb) => {		// attach on method
									Log("attach listener on",channel,cb?true:false);
									cbs[channel] = cb;
								};

								socket.emit = (channel,req) => {	// attach emit method
									Log("emit to client", channel, req);
									sio.send( socket, {
										channel: channel,
										message: req,
										id: id
									});
								};
								
								cb( socket );
								break;

							// trap client defined channels
								
							default:
								cb( message );
						}
						
						// can optionally respond with an acknowlegement - but client will need to listen for it
						
						if ( ack )
							send(socket, { message: ack } );
						
						// dont close the socket! We need it open to emit to the entire ecosystem
						//socket.end();
					}
					
					else
					if ( cb = cbs.error )
						cb( new Error(`invalid socketio control on channel=${channel}`) );

					else
						Log( `invalid control on channel=${channel} - reconnect client` );
				}
				
				else {
					Log("connected");
				}
			}
			
			catch (err) {
				Log("ctrl pk err", err);
				if ( cb = cbs.error )
					cb( new Error("invalid control packet - reconnect client") );
				
				else {
					Log( "invalid control packet - reconnect client" );
				}
			}
		});
		
	});
	
	return sio;
}

