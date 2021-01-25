# SOCKETIO

**SocetIO** provides a form-fit-functional replacement for the notoriously buggy [Socket.IO](https://www.npmjs.com/package/socket.io) and its close cousin 
[Socet.IO-Client](https://www.npmjs.com/package/socket.io-client).  Like its Socket.IO predecessors, SocketIO presently
provides json-based web sockets, though it has hooks to support binary sockets (for VoIP, video, etc) applications.

Per the [Socket.IO](https://socket.io/docs/v3/client-initialization/) specification, **SocketIO** provides both a 
server-side interface:

	const SIO = require("socketio");
	
	IO = SIO(server);					// connects to your nodejs server
	
	IO.on( "connect", socket => {		// "connect" is a reserved CHANNEL to attach other CHANNELs
	
		socket.on(  "CHANNEL", req => {			// intercepts client request made on socket to this CHANNEL
			console.log( "here is the client's request", req ); 
		});
		
		/* etc for other CHANNELs */
		
	});
	
	IO.emit({ .... })  			// to emit a request to all clients
	
and a client-side interface:

	const
		socket = io();

	socket.emit("JOIN", {		// connect with server side on its JOIN channel
		...
	});
	
	io.on("CHANNEL", req => {
		console.log("server sent this request", req);
	});
	
	/* etc for other CHANNELs */
	
imported into the browsers via:

	<script type="text/javascript, src="/socketio/socketio-client.js">

where your server is responsible for service its "/socketio" endpoint.

## Installation

Clone [SocketIO](https://github.com/totemstan/socketio) || [COE](https://sc.appdev.proj.coe/acmesds/socketio) || [SBU](https://gitlab.gsmil/acmesds/socketio) into your PROJECT/totem folder.   

## Contacting, Contributing, Following

Feel free to [submit and status TOTEM issues](http://totem.hopto.org/issues.view) || [COE](https://totem.west.ile.nga.ic.gov/issues.view) || [SBU](https://totem.nga.mil/issues.view), [contribute TOTEM notebooks](http://totem.hopto.org/shares/notebooks/) || [COE](https://totem.west.ile.nga.ic.gov/shares/notebooks/) || [SBU](https://totem.nga.mil/shares/notebooks/),
[inspect TOTEM requirements](http://totem.hopto.org/reqts.view) || [COE](https://totem.west.ile.nga.ic.gov/reqts.view) || [SBU](https://totem.nga.mil/reqts.view), [browse TOTEM holdings](http://totem.hopto.org/) || [COE](https://totem.west.ile.nga.ic.gov/) || [SBU](https://totem.nga.mil/), 
or [follow TOTEM milestones](http://totem.hopto.org/milestones.view) || [COE](https://totem.west.ile.nga.ic.gov/milestones.view) || [SBU](https://totem.nga.mil/milestones.view).

## License

[MIT](LICENSE)
