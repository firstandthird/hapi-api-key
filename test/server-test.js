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

lab.test('will signal if authenticated', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    validateKey(token) {
      return { isValid: true, credentials: { name: 'This is a test' } };
    },
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
  code.expect(response.result.isAuthenticated).to.equal(true);
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
  server.auth.default('api-key');
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => request.auth
  });
  const response = await server.inject({ url: '/?token=mySpecialKey' });
  code.expect(response.statusCode).to.equal(200);
});

lab.test('api keys can also be specified in array form ', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    apiKeys: [{
      key: 'mySpecialKey',
      name: 'Is Good'
    }]
  });
  server.auth.default('api-key');
  server.route({
    method: 'GET',
    path: '/',
    config: {
      auth: 'api-key'
    },
    handler: (request, h) => request.auth
  });
  const response = await server.inject({ url: '/?token=mySpecialKey' });
  code.expect(response.statusCode).to.equal(200);
  const badResponse = await server.inject({ url: '/?token=notMySpecialKey' });
  code.expect(badResponse.statusCode).to.equal(401);
});

lab.test('lets you specify a name for the param that contains the api key ', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    apiKeys: {
      knockknock: {
        name: 'Who Is There'
      }
    },
    queryKey: 'api'
  });
  server.auth.default('api-key');
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => request.auth
  });
  const response = await server.inject({ url: '/?api=knockknock' });
  code.expect(response.statusCode).to.equal(200);
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
      handler: (request, h) => request.auth
    }
  });
  const response = await server.inject({
    url: '/',
    headers: {
      'X-API-KEY': 'knockknock'
    }
  });
  code.expect(response.statusCode).to.equal(200);
});

lab.test('you can specify api keys when you register', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {
      mode: false,
      strategy: {
        name: 'apikey',
        apiKeys: {
          knockknock: {
            name: 'whoIsThere'
          }
        }
      }
    }
  });
  server.route({
    method: 'GET',
    path: '/',
    config: {
      auth: 'apikey'
    },
    handler: (request, h) => request.auth
  });
  const response = await server.inject({ url: '/?token=knockknock' });
  code.expect(response.statusCode).to.equal(200);
  const response2 = await server.inject({ url: '/?token=knockknock2' });
  code.expect(response2.statusCode).to.equal(401);
});

lab.test('lets you pass a validate function', async() => {
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    validateKey(token) {
      if (token === 'test') {
        return { isValid: true, credentials: { name: 'This is a test' } };
      }
    },
  });
  server.auth.default('api-key');
  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: (request, h) => request.auth
    }
  });
  const response = await server.inject({ url: '/?token=test' });
  code.expect(response.statusCode).to.equal(200);
});

lab.test('lets you pass a validate function as server method', async() => {
  server.method('validate', (token) => {
    if (token === 'test') {
      return { isValid: true, credentials: { name: 'This is a test' } };
    }
  });

  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    validateKey: 'validate'
  });
  server.auth.default('api-key');
  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: (request, h) => request.auth
    }
  });
  const response = await server.inject({ url: '/?token=test' });
  code.expect(response.statusCode).to.equal(200);
});

lab.test('validate function works when defined in plugin options', async() => {
  server.method('validate', (token) => {
    if (token === 'test') {
      return { isValid: true, credentials: { name: 'This is a test' } };
    }
  });

  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {
      strategy: {
        validateKey: 'validate',
        name: 'serverKey'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    config: {
      auth: 'serverKey',
      handler: (request, h) => request.auth
    }
  });
  const response = await server.inject({ url: '/?token=test' });
  code.expect(response.statusCode).to.equal(200);
});
