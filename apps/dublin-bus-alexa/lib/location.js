const fetch = require('node-fetch');
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_KEY,
  Promise: Promise
});

const checkLocationPermissions = (request, response) => {
  const consentToken =
    request.context.System.user.permissions &&
    request.context.System.user.permissions.consentToken;

  if (!consentToken) {
    response.card({
      type: "AskForPermissionsConsent",
      permissions: ["read::alexa:device:all:address"] // full address
    });
  }

  return consentToken;
};

const getLocation = (request) => {
  const deviceId = request.context.System.device.deviceId;
  const apiEndpoint = request.context.System.apiEndpoint;
  const accessToken = request.context.System.apiAccessToken;

  return fetch({
    method: 'GET',
    url: `${apiEndpoint}/v1/devices/${deviceId}/settings/address`,
    headers: {
      'Authorization': `Basic ${accessToken}`,
      'Accept': 'application/json'
    }
  }).then(resp => resp.json());
};

const getDeviceLocation = (request) => {
  return new Promise((resolve, reject) => {
    getLocation(request).then(loc => {
      console.log(loc);

      if (loc.countryCode !== 'IE' || loc.city.toLowerCase() !== 'dublin') {
        reject(new Error('INVALID_LOCATION'));
      }

      const address = [
        loc.addressLine1,
        loc.addressLine2,
        loc.addressLine3,
        loc.city,
        loc.postalCode,
        loc.stateOrRegion,
        loc.countryCode
      ];

      googleMapsClient.geocode({
          address: address.filter(item => item).join(', '),
          components: {
            country: loc.countryCode
          }
        })
        .asPromise()
        .then((response) => {
          resolve(response.json.results);
        })
        .catch((err) => {
          reject(err);
        });
    });
  })
};

module.exports = {
  checkLocationPermissions,
  getDeviceLocation
};