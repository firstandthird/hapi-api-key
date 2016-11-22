'use strict';
const Boom = require('boom');
const Hoek = require('hoek');

const pluginDefaults = {
  schemeName: 'api-key'
};

const schemeDefaults = {
  apiKeys: {},
  validateKey: null,
  // by default the incoming POST will
  // look in request.query.token for the api key:
  queryKey: 'token',
  headerKey: 'x-api-key'
};
exports.register = (server, pluginOptions, next) => {
  pluginOptions = Hoek.applyToDefaults(pluginDefaults, pluginOptions);

  server.auth.scheme(pluginOptions.schemeName, (authServer, options) => {
    options = Hoek.applyToDefaults(schemeDefaults, options);

    let validateKey = options.validateKey;

    if (typeof options.validateKey !== 'function') {
      validateKey = (token, done) => {
        done(options.apiKeys[token]);
      };

      if (typeof options.validateKey === 'string') {
        validateKey = Hoek.reach(server.methods, options.validateKey, {
          default: validateKey
        });
      }
    }

    return {
      authenticate: (request, reply) => {
        // check in both the query params and the X-API-KEY header for an api key:
        const apiKey = request.headers[options.headerKey] ?
          request.headers[options.headerKey] : request.query[options.queryKey];
        // get the credentials for this key:

        validateKey(apiKey, (credentials) => {
          if (credentials !== undefined) {
            return reply.continue({ credentials });
          }
          // otherwise return a 401:
          return reply(Boom.unauthorized('Invalid API Key.'));
        });
      }
    };
  });
  /* will call server.auth.strategy
   package should be of the form:
   strategy: {
    name: 'myStrategyName',
    mode: true // (can be any valid strategy mode)
    apiKeys: {
      'anAPIKey': {
        name: 'authenticationName'
      }
    ]
   }
  */
  if (pluginOptions.strategy) {
    server.auth.strategy(pluginOptions.strategy.name,
      pluginOptions.schemeName,
      pluginOptions.strategy.mode,
      { apiKeys: pluginOptions.strategy.apiKeys });
  }
  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
