# Traffic Manager Agent

[![NPM Version][npm-img]][npm-url]
[![NPM Downloads][npm-dl-img]][npm-url]
[![Build status][circle-img]][circle-url]
<!-- [![Coveralls coverage][coveralls-img]][coveralls-url] -->

[npm-url]: https://npmjs.org/package/traffic-manager-agent
[npm-img]: https://img.shields.io/npm/v/traffic-manager-agent.svg
[npm-dl-img]: https://img.shields.io/npm/dm/traffic-manager-agent.svg
[circle-img]: https://img.shields.io/circleci/project/github/vot/traffic-manager-agent/master.svg
[circle-url]: https://circleci.com/gh/vot/traffic-manager-agent/tree/master
<!-- [coveralls-img]: https://img.shields.io/coveralls/vot/traffic-manager-agent.svg
[coveralls-url]: https://coveralls.io/github/vot/traffic-manager-agent -->


Middleware in your Node application to collect the incoming requests.

## Integrating into Node app

### First steps

Add agent module to your project's dependencies

```
npm install traffic-manager-agent --save
```

After this just follow the instructions to generate accesslog of your application
(Apache Common Log Format), send data to Traffic Manager Hub or both.


### Basic accesslog

This is enough to get a full access log generated in your application.

Produces Apache Common Log Format (CLF) which can be analysed further with
tools readily available.


Just register the middleware before other routes in your app and restart the app.

```
const TrafficManagerAgent = require('traffic-manager-agent');

const trafficManagerOpts = {
  reporters: {
    File: {
      enabled: true,
      format: 'apache'
      location: './access_log'
    },
  }
};

const trafficManagerMiddleware = TrafficManagerAgent(trafficManagerOpts);

app.use(trafficManagerMiddleware);
```


### Sending data to Traffic Manager Hub

You can use this module to integrate with Traffic Manager Hub directly.

This is desired when you need more insight into your application's incoming traffic,
understand the patterns in it, perform early threat analysis and shape the traffic
with customisable rate limiting.

```
const TrafficManagerAgent = require('traffic-manager-agent');

const trafficManagerOpts = {
  reporters: {
    TMHub: {
      enabled: true,
      rate: 10,
      url: 'https://trafficmanager.example.com',
      siteId: '2fb5193d923f4b71ad6a771e8700aa1f',
      siteSecret: 'zN2EY69fmy303MUEs7ZkQv8sqeuFjFEp'
    }
  }
};

const trafficManagerMiddleware = TrafficManagerAgent(trafficManagerOpts);

app.use(trafficManagerMiddleware);
```

### Available reporters

You can combine multiple reporters in a single application.

For example you can have a standard accesslog produced for the infrastructure team,
console output for developers and a web UI with basic analysis for everyone else.

Simply expand the reporters property to provide more outputs.

Each reporter has at least `enabled` property which accepts `true` and `false` values.

**Available reporters:**

- StdOut
- File
- TMHub


```
const TrafficManagerAgent = require('traffic-manager-agent');

const trafficManagerOpts = {
  reporters: {
    File: {
      enabled: true,
      format: 'apache'
      location: './access_log'
    },
    StdOut: {
      enabled: true
    },
    TMHub: {
      enabled: true,
      rate: 30,
      url: 'https://trafficmanager.example.com',
      siteId: '2fb5193d923f4b71ad6a771e8700aa1f',
      siteSecret: 'zN2EY69fmy303MUEs7ZkQv8sqeuFjFEp'
    }
  }
};

const trafficManagerMiddleware = TrafficManagerAgent(trafficManagerOpts);

app.use(trafficManagerMiddleware);
```
