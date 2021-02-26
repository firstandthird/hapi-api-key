## hapi-api-key


[![Build Status](https://travis-ci.org/firstandthird/hapi-api-key.svg?branch=master)](https://travis-ci.org/firstandthird/hapi-api-key)

Hapi auth scheme that allows users to access a route based on whether they have a valid api key presented either as a query or as a header.
Register hapi-api-key as a plugin
to make the 'api-key' scheme available for use with server.auth.strategy(...).

### Installation

`npm install hapi-api-key`

### Usage

```javascript
  const hapiApiKeyPlugin = require('hapi-api-key');
  await server.register({
    plugin: hapiApiKeyPlugin,
    options: {}
  });
  server.auth.strategy('api-key', 'api-key', {
    apiKeys: {
      1234: {
        name: 'Michiel'
      }
    }
  });
```

### Options

- __apiKeys__ (required)

  List of allowed API keys

- __schemeName__

  The name hapi will use to refer to the schema.  By default this is 'api-key' but you
  can make it whatever you want.

- __validateKey__

  hapi-api-key comes with a default function that approves or denies access
  based on whether the header or field matches the list of allowed API keys,
  but you can provide your own validateKey function instead.  Alternatively you
  can specify validateKey as a string, in which case hapi-api-key will look for a
  server method with that name in _server.methods_.

- __queryKey__

  The query field that contains the API key, by default this is 'token' (i.e.
    _?token=1234567_) but you can override this to be whatever you want.

- __headerKey__

  The header field that contains the API key, by default this is the _x-api-key_
  header but you can override this to be whatever you want.

- __strategy__

  By default hapi-api-key registers the api-key scheme with HAPI and then you manually register
  a strategy that uses that scheme with server.auth.strategy(). But you can have hapi-api-key
  register the strategy for you by passing a _strategy_ object when you register the plugin:
```js
{
  strategy: {
   name: 'myStrategyName',
   mode: true,
   apiKeys: {
     'anAPIKey': {
       name: 'authenticationName'
     }
   ]
  }
}
  ```
