'use strict';
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();
const hapiApiKeyPlugin = require('../index.js');

let server;
lab.beforeEach(() => {
  server = new Hapi.Server({});
});

lab.afterEach(async() => {
  await server.stop();
});

lab.test('will reject normal requests ', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    apiKeys: {
      knockknock: {
        name: 'Who Is There'
      }
    }
  });
  server.auth.default('api-key');
  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: (request, h) => request.auth
    }
  });
  const response = await server.inject({ url: '/' });
  code.expect(response.statusCode).to.equal(401);
});

lab.test('will reject requests with a bad api key ', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    apiKeys: {
      knockknock: {
        name: 'Who Is There'
      }
    }
  });
  server.auth.default('api-key');
  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: (request, h) => request.auth
    }
  });
  const response = await server.inject({ url: '/?token=letmein' });
  code.expect(response.statusCode).to.equal(401);
});

lab.test('should allow passage if a correct api key is posted ', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    apiKeys: {
      knockknock: {
        name: 'Who Is There'
      }
    }
  });
  server.auth.default('api-key');
  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: (request, h) => request.auth
    }
  });
  const response = await server.inject({ url: '/?token=knockknock' });
  code.expect(response.statusCode).to.equal(200);
});

lab.test('lets you pass a custom list of api keys ', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    apiKeys: {
      mySpecialKey: {
        name: 'Is Good'
      }
    }
  });
  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: (request, h) => {
        return request.auth;
      }
    }
  });
  const response = await server.inject({ url: '/?token=mySpecialKey' });
  code.expect(response.statusCode).to.equal(200);
});
/*
lab.test('lets you specify a name for the param that contains the api key ', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
    server.auth.strategy('api-key', 'api-key', true, {
      apiKeys: {
        knockknock: {
          name: 'Who Is There'
        }
      },
      queryKey: 'api'
    });
    server.route({
      method: 'GET',
      path: '/',
      config: {
        handler: (request, reply) => {
          reply(request.auth);
        }
      }
    });
    server.inject({
      url: '/?api=knockknock',
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      done();
    });
  });
});

lab.test('you can pass the api key in the X-API-KEY header as well', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    apiKeys: {
      knockknock: {
        name: 'Who Is There'
      }
    }
  });
  server.auth.default('api-key');
    server.route({
      method: 'GET',
      path: '/',
      config: {
        handler: (request, reply) => {
          reply(request.auth);
        }
      }
    });
    server.inject({
      url: '/',
      headers: {
        'X-API-KEY': 'knockknock'
      }
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      done();
    });
  });
});

lab.test('you can specify api keys when you register', async() => {
  server.register({
    register: hapiApiKeyPlugin,
    options: {
      strategy: {
        name: 'apikey',
        mode: false,
        apiKeys: {
          knockknock: {
            name: 'whoIsThere'
          }
        }
      }
    }
  }, (err) => {
    if (err) {
      throw err;
    }
    server.route({
      method: 'GET',
      path: '/',
      config: {
        auth: 'apikey'
      },
      handler(request, reply) {
        reply(request.auth);
      }
    });
    server.inject({
      url: '/?token=knockknock',
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      server.inject({
        url: '/?token=knockknock2',
      }, (response2) => {
        code.expect(response2.statusCode).to.equal(401);
        done();
      });
    });
  });
});

lab.test('lets you pass a validate function', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
    server.auth.strategy('api-key', 'api-key', true, {
      validateKey(token, next) {
        if (token === 'test') {
          return next(null, true, {
            name: 'This is a test'
          });
        }
      }
    });
    server.route({
      method: 'GET',
      path: '/',
      config: {
        handler: (request, reply) => {
          reply(request.auth);
        }
      }
    });
    server.inject({
      url: '/?token=test',
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      done();
    });
  });
});

lab.test('lets you pass a validate function as server method', async() => {
  server.method('validate', (token, next) => {
    if (token === 'test') {
      return next(null, true, {
        name: 'This is a test'
      });
    }
  });

  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
    server.auth.strategy('api-key', 'api-key', true, {
      validateKey: 'validate'
    });
    server.route({
      method: 'GET',
      path: '/',
      config: {
        handler: (request, reply) => {
          reply(request.auth);
        }
      }
    });
    server.inject({
      url: '/?token=test',
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      done();
    });
  });
});
*/
