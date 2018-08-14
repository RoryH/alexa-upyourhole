const fetch = require('node-fetch');

const getBusTimesAtStop = (route, latlng) => {
  return new Promise((resolve, reject) => {
    fetch({
      url: `https://roryhaddon.com/api/dublin/bus/route/${route}`,
      method: 'GET'
    }).then(result => {
      const nearestStops = findNearestStops(result, latlng);
      Promise.all([
        getRouteTimesForStop(nearestStops.inbound, route),
        getRouteTimesForStop(nearestStops.outbound, route)
      ])
    });
  })
}

const findNearestStops = (routeResult, latlng) => {
  return {
    inbound: findNearestStop(routeResult.stops.InboundStop, latlng),
    outbound: findNearestStop(routeResult.stops.InboundStop, latlng)
  }
}

const findNearestStop = (stops, latlng) => {
  let shortestDistance = null;
  let closestStop = null;
  for (let i = 0; i < stops.length; i++) {
    const thisDistance = getDistanceBetweenPoints({
      lat: stops[i].Latitude,
      lng: stops[i].Longitude
    }, latlng);
    if (shortestDistance === null || thisDistance < shortestDistance) {
      shortestDistance = thisDistance;
      closestStop = i
    }
  }
  return stops[i];
}

const getRouteTimesForStop = (stop, route) => {
  fetch({
    url: `https://roryhaddon.com/api/dublin/bus/stop/${stop.StopNumber}`,
    method: 'GET'
  }).then(resp => resp.json())
  .then((busTimes) => {
    const thisRouteTimes = busTimes.departures.filter(dep => dep.MonitoredVehicleJourney_LineRef.toLowerCase() === route.toLowerCase());
    thisRouteTimes
  })

};

const getMinsBetweenStamps = function(st1, st2) {
  const _getJsDate = function(str) {
      return new Date(Date.UTC(
              parseInt(str.substr(0,4),10),
              parseInt(str.substr(5,2),10)-1,
              parseInt(str.substr(8,2),10),
              parseInt(str.substr(11,2),10),
              parseInt(str.substr(14,2),10),
              parseInt(str.substr(17,2),10)
          ));
  }

  const mins = Math.abs(Math.floor(( _getJsDate(st1) - _getJsDate(st2)) / 1000 / 60));
  if (mins == 0) {
      return "DUE";
  } else {
      return mins;
  }
}


const toRad = function(num) {
  return num * Math.PI / 180;
};

const getDistanceBetweenPoints = (llOne, llTwo) => {
  const R = 6371; // radius of earth in km
  const dLat = toRad(llTwo.lat-llOne.lat);
  const dLon = toRad(llTwo.lng-llOne.lng);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(toRad(llOne.lat)) * Math.cos(toRad(llTwo.lat)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

module.exports = {
  getBusTimesAtStop
};