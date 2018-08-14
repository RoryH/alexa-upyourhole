const express = require("express");
const alexa = require("alexa-app");
const express_app = express();
const location = require('./lib/location.js');
const dublinTransitService = require('./lib/dublin-transit-service.js');

const app = new alexa.app("dublin-bus");
// setup the alexa app and attach it to express before anything else
app.express({
	expressApp: express_app
});

app.intent("busTimes", {
		"slots": {
			"BUS_ROUTE": "BUS_ROUTE"
		},
		"utterances": ["when is the next {BUS_ROUTE}"]
	},
	function (request, response) {
		var busRoute = request.slot("BUS_ROUTE");

		if (location.checkLocationPermissions(request, response)) {
			location.getDeviceLocation(request).then(results => {
				console.log(results);
				if (results.length > 0) {
					dublinTransitService.getBusTimesAtStop(busRoute, results[0].geometry.location);
				}
			});

			var number = request.slot("BUS_ROUTE");
			response.say(`The ${number} bus is slow`);
		};
	}
);

module.exports = app;