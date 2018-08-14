var AlexaAppServer = require('alexa-app-server');
 
var instance = AlexaAppServer.start({
	server_root: __dirname,     // Path to root
	public_html: "public_html", // Static content
	app_dir: "apps",            // Location of alexa-app modules
	app_root: "/alexa/",        // Service root
	port: 3008,                  // Port to use
	debug: false,
	verify: true
});
