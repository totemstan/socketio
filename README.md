# SOCKETIO

**SocetIO** provides a form-fit-functional replacement for the notoriously buggy [Socket.IO](https://www.npmjs.com/package/socket.io) 
and its [Socet.IO-Client](https://www.npmjs.com/package/socket.io-client) client counterpart.  Like its Socket.IO predecessors, 
**SocketIO** provides json-based web sockets, though it has hooks to support binary sockets (for VoIP, video, etc) applications.
**SocketIO** provides both a server-side and client-side modules that mimic the [Socket.IO](https://socket.io/docs/v3/client-initialization/)
specification (less the bugs).

## Server side usage

On the server:

	const SIO = require("socketio");
	
	IO = SIO(server);					// connects socketIO to your nodejs server
	
	IO.on( "connect", socket => {		// the client automatically emits a "connect" request when it calls io()  
	
		socket.on(  "CHANNEL", (req,socket) => {			// intercepts client request made on socket to this CHANNEL
			console.log( "here is the client's request", req ); 
			socket.emit({ message: "a response" });
			IO.emit({ message: "a message for everyone!" });
			IO.emitOthers("SkipThisClient", { message: "a message for everyone!" });		// useful emit extension
			IO.clients["someone@totem.org"].emit({ message: "you get an extra message"});
		});
		
		/* etc for other CHANNELs */
		
	});
	
	IO.emit({ .... })  			// to emit a request to all clients

## Client side usage

On the client-side:

	<script type="text/javascript, src="/socketio/socketio-client.js"></script>

	const
		ioSocket = io();			// connect to socketIO by emitting a "connect" request
		ioClient = "myClientName"

	ioSocket.emit("CHANNEL", {		// send request to server side on its CHANNEL
		...
	});
	
	ioSocket.on("CHANNEL", req => {
		console.log("server sent this request", req);
	});
	
## Installation

Clone [SocketIO](https://github.com/totemstan/socketio) || [COE](https://sc.appdev.proj.coe/acmesds/socketio) || [SBU](https://gitlab.gsmil/acmesds/socketio) into your PROJECT/socketio folder.   

## Contacting, Contributing, Following

Feel free to [submit and status TOTEM issues](http://totem.hopto.org/issues.view) || [COE](https://totem.west.ile.nga.ic.gov/issues.view) || [SBU](https://totem.nga.mil/issues.view), [contribute TOTEM notebooks](http://totem.hopto.org/shares/notebooks/) || [COE](https://totem.west.ile.nga.ic.gov/shares/notebooks/) || [SBU](https://totem.nga.mil/shares/notebooks/),
[inspect TOTEM requirements](http://totem.hopto.org/reqts.view) || [COE](https://totem.west.ile.nga.ic.gov/reqts.view) || [SBU](https://totem.nga.mil/reqts.view), [browse TOTEM holdings](http://totem.hopto.org/) || [COE](https://totem.west.ile.nga.ic.gov/) || [SBU](https://totem.nga.mil/), 
or [follow TOTEM milestones](http://totem.hopto.org/milestones.view) || [COE](https://totem.west.ile.nga.ic.gov/milestones.view) || [SBU](https://totem.nga.mil/milestones.view).

## License

[MIT](LICENSE)


## Modules

<dl>
<dt><a href="#module_SOCKETIO">SOCKETIO</a></dt>
<dd><p>Replaces the buggy socket.io and socket.io-client modules.</p>
<pre><code>ref: https://medium.com/hackernoon/implementing-a-websocket-server-with-node-js-d9b78ec5ffa8
</code></pre>
</dd>
<dt><a href="#module_SOCKETIO-CLIENT">SOCKETIO-CLIENT</a></dt>
<dd><p>Replaces the buggy socket.io and socket.io-client modules.</p>
</dd>
</dl>

<a name="module_SOCKETIO"></a>

## SOCKETIO
Replaces the buggy socket.io and socket.io-client modules.

	ref: https://medium.com/hackernoon/implementing-a-websocket-server-with-node-js-d9b78ec5ffa8

**Requires**: <code>module:CRYPTO</code>  
<a name="module_SOCKETIO-CLIENT"></a>

## SOCKETIO-CLIENT
Replaces the buggy socket.io and socket.io-client modules.


* * *

&copy; 2012 ACMESDS
