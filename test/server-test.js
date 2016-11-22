'use strict';
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();
const hapiApiKeyPlugin = require('../index.js');

let server;
lab.beforeEach((done) => {
  server = new Hapi.Server({});
  server.connection();
  done();
});

lab.afterEach((done) => {
  server.stop(() => {
    done();
  });
});

lab.test('will reject normal requests ', (done) => {
  server.register({
    register: hapiApiKeyPlugin,
    options: {}
  }, (err) => {
    if (err) {
      throw err;
    }
    server.auth.strategy('api-key', 'api-key', true, {
      apiKeys: {
        'knockknock' : {
          name: 'Who Is There'
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
      url: '/'
    }, (response) => {
      code.expect(response.statusCode).to.equal(401);
      done();
    });
  });
});

lab.test('will reject requests with a bad api key ', (done) => {
  server.register({
    register: hapiApiKeyPlugin,
    options: {}
  }, (err) => {
    if (err) {
      throw err;
    }
    server.auth.strategy('api-key', 'api-key', true, {
      apiKeys: {
        'knockknock' : {
          name: 'Who Is There'
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
      url: '/?token=letmein',
    }, (response) => {
      code.expect(response.statusCode).to.equal(401);
      done();
    });
  });
});

lab.test('should allow passage if a correct api key is posted ', (done) => {
  server.register({
    register: hapiApiKeyPlugin,
    options: {}
  }, (err) => {
    if (err) {
      throw err;
    }
    server.auth.strategy('api-key', 'api-key', true, {
      apiKeys: {
        'knockknock' : {
          name: 'Who Is There'
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
      url: '/?token=knockknock',
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      done();
    });
  });
});

lab.test('lets you pass a custom list of api keys ', (done) => {
  server.register({
    register: hapiApiKeyPlugin,
    options: {}
  }, (err) => {
    if (err) {
      throw err;
    }
    server.auth.strategy('api-key', 'api-key', true, {
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
        handler: (request, reply) => {
          reply(request.auth);
        }
      }
    });
    server.inject({
      url: '/?token=mySpecialKey',
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      done();
    });
  });
});

lab.test('lets you specify a name for the param that contains the api key ', (done) => {
  server.register({
    register: hapiApiKeyPlugin,
    options: {}
  }, (err) => {
    if (err) {
      throw err;
    }
    server.auth.strategy('api-key', 'api-key', true, {
      apiKeys: {
        'knockknock' : {
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

lab.test('you can pass the api key in the X-API-KEY header as well', (done) => {
  server.register({
    register: hapiApiKeyPlugin,
    options: {}
  }, (err) => {
    if (err) {
      throw err;
    }
    server.auth.strategy('api-key', 'api-key', true, {
      apiKeys: {
        'knockknock' : {
          name: 'Who Is There'
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

lab.test('you can specify api keys when you register', (done) => {
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
      }, (response) => {
        code.expect(response.statusCode).to.equal(401);
        done();
      });
    });
  });
});

lab.test('lets you pass a validate function', (done) => {
  server.register({
    register: hapiApiKeyPlugin,
    options: {}
  }, (err) => {
    if (err) {
      throw err;
    }
    server.auth.strategy('api-key', 'api-key', true, {
      validateKey(token, next) {
        if (token === 'test') {
          return next({
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

lab.test('lets you pass a validate function as server method', (done) => {
  server.method('validate', (token, next) => {
    if (token === 'test') {
      return next({
        name: 'This is a test'
      });
    }
  });

  server.register({
    register: hapiApiKeyPlugin,
    options: {}
  }, (err) => {
    if (err) {
      throw err;
    }
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
