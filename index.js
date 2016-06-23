const Boom = require('boom');
const Hoek = require('hoek');

const pluginDefaults = {
  schemeName: 'api-key'
};

const schemeDefaults = {
  apiKeys: {
  },
  // by default the incoming POST will
  // look in request.query.token for the api key:
  queryKey: 'token',
  headerKey: 'x-api-key'
};
exports.register = (server, pluginOptions, next) => {
  pluginOptions = Hoek.applyToDefaults(pluginDefaults, pluginOptions);

  server.auth.scheme(pluginOptions.schemeName, (authServer, options) => {
    options = Hoek.applyToDefaults(schemeDefaults, options);
    return {
      authenticate: (request, reply) => {
        // check in both the query params and the X-API-KEY header for an api key:
        const apiKey = request.headers[options.headerKey] ?
          request.headers[options.headerKey] : request.query[options.queryKey];
        // get the credentials for this key:
        const credentials = options.apiKeys[apiKey];
        if (credentials !== undefined) {
          return reply.continue({ credentials });
        }
        // otherwise return a 401:
        return reply(Boom.unauthorized('Invalid API Key.'));
      }
    };
  });
  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
