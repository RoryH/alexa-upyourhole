
const express = require("express");
const alexa = require("alexa-app");
const express_app = express();

const app = new alexa.app("dublin-bus");
// setup the alexa app and attach it to express before anything else
app.express({ expressApp: express_app });

app.intent("busTimes", {
	"slots": { "BUS_ROUTE": "BUS_ROUTE" },
	"utterances": ["when is the next {BUS_ROUTE}"]
},
function(request, response) {
	var number = request.slot("BUS_ROUTE");
	response.say(`The ${number} bus is slow`);
}
);

// now POST calls to /sample in express will be handled by the app.request() function
// GET calls will not be handled
module.exports = app;
