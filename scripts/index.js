const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const toWords = require('number-to-words').toWords;

const busRoutes = require('./busroutes.json').routes.Route.map(route => route.Number);
const routesAsWords = [];
const valueMap = {};

function getWords(num) {
    return toWords(parseInt(num, 10)).replace(/\-/g, ' ');
}

busRoutes.forEach(route => {
    if (!/^\d+\w?$/.test(route)) {
        return;
    }
    const appendix = /\w$/.test(route) ? route.replace(/\d+/g, '') : '';
    let numericalRoute = route.replace(/[^\d]+/g, '');
    const words = [];

    addSlotTypeValue([ getWords(numericalRoute), appendix ].join(' ').trim(), route);

    if (numericalRoute.length > 1) {
        addSlotTypeValue(_.flatten([numericalRoute.split('').map(num => getWords(num)), appendix]).join(' ').trim(), route);

        if (numericalRoute.length > 2) {
            addSlotTypeValue([
                getWords(numericalRoute.substr(0,1)),
                getWords(numericalRoute.substr(1)),
                appendix].join(' ').trim(),
				route
			);
        }
    }
});

function addSlotTypeValue(words, route) {
	valueMap[route] = valueMap[route] || [];
	valueMap[route].push(words);
}

function zerosToOhs(arr, words) {
    const zeroLoc = words.indexOf('zero');
    if (zeroLoc > -1) {
        const wordsClone = words.splice(0).map(word => word === 'zero' ? 'oh': word);
        arr.push(wordsClone.join(' '));
    }
}

const routeArray = Object.keys(valueMap);
routeArray.sort().reverse();

routeArray.forEach(route => {
	const synonyms = valueMap[route].map(synonym => `"${synonym}"`).join(',');
	let csvLine = `"${route}","${route}",${synonyms}`;
	routesAsWords.push(csvLine);
}) 
fs.writeFileSync(path.join(__dirname, 'busrouteswords.csv'), routesAsWords.join('\n'), { encoding: 'utf8' });

