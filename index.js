'use strict';
const Boom = require('@hapi/boom');
const Hoek = require('@hapi/hoek');

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

const register = (server, pluginOptions) => {
  pluginOptions = Hoek.applyToDefaults(pluginDefaults, pluginOptions);

  server.auth.scheme(pluginOptions.schemeName, (authServer, options) => {
    options = Hoek.applyToDefaults(schemeDefaults, options);

    let validateKey = options.validateKey;

    if (typeof options.validateKey !== 'function') {
      validateKey = (token) => {
        // if the apiKeys are listed in an array, see if any match:
        if (Array.isArray(options.apiKeys)) {
          const key = options.apiKeys.find(entry => entry.key === token);
          if (key) {
            // don't need the key name in the credentials:
            delete key.key;
            return { isValid: true, credentials: key };
          }
          return { isValid: false };
        }
        // otherwise the api keys are listed as an object of { key: credentials } pairs:
        const ret = { isValid: true, credentials: options.apiKeys[token] };
        return ret;
      };

      if (typeof options.validateKey === 'string') {
        validateKey = Hoek.reach(server.methods, options.validateKey);
        if (!validateKey) {
          throw new Error(`server.methods did not contain a method called ${options.validateKey}`);
        }
      }
    }

    return {
      authenticate: async(request, h) => {
        // check in both the query params and the X-API-KEY header for an api key:
        const apiKey = request.headers[options.headerKey] ?
          request.headers[options.headerKey] : request.query[options.queryKey];

        try {
          // get the credentials for this key:
          const { isValid, credentials } = await validateKey(apiKey, request);
          // if they are valid then continue processing:
          if (isValid && credentials !== undefined) {
            return h.authenticated({ credentials });
          }
          // otherwise always return a 401:
        } catch (err) {
          // does not have to do anything
        }
        throw Boom.unauthorized('Invalid API Key.');
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
      pluginOptions.strategy);
  }
};

exports.plugin = {
  register,
  once: true,
  pkg: require('./package.json')
};
