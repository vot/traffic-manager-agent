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
  reporters: [
    {
      type: 'event',
      output: 'file',
      format: 'apache',
      location: `${__dirname}/../accesslog.log`,
    },
  ]
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
  reporters: [
    {
      type: 'frame',
      output: 'tmhub',
      url: 'https://trafficmanager.example.com',
      siteId: '2fb5193d923f4b71ad6a771e8700aa1f',
      siteSecret: 'ZSU5M2UyMGE5N2JjNDFmODkxMTVjNWViNjVmY2U0MGY=',
    }
  ]
};

const trafficManagerMiddleware = TrafficManagerAgent(trafficManagerOpts);

app.use(trafficManagerMiddleware);
```

### Settings

`trafficManagerOpts` object passed to Traffic Manager Agent middleware can
be used to control reporters as well as some local settings.

These additional settings can be set as properties
of the `settings` object in `trafficManagerOpts`.

- `blacklistedIps` - (default: `[]`)
- `whitelistedIps` - (default: `[]`)
- `perThreadRateLimit` - (default: `0`) request limit per user in the specified frame.
Useful when you don't need to connect to Traffic Manager Hub and want simple throttling solution.
- `frameDurationSeconds` - (default: `60`) duration of the monitoring frame in seconds

These settings will only apply to the agent and the app process in which
it's implemented.

To rate limit across multiple instances of your application you'll need to
aggregate the results in _Traffic Manager Hub_ (available as a reporter, read more below).


### Reporters

You can combine multiple reporters in a single application.

There are two `types` of reporters - an _event reporter_ which logs every request
immediately, and a _frame reporter_ which aggregates a full frame before
reporting.

#### Event reporters

- `stdout`
- `file`

**Options:**

- `format` - `apache`, `short` or `json`
- `filter` - allows selecting messages you want to log, i.e. you can use `{ statusCode: 429 }` to produce a "block log"
- `location` - (only for `file` reporter) specifies where the log file will be placed

#### Frame reporters

- `stdout`
- `tmhub`

**tmhub**

`tmhub` is used to link with **Traffic Manager Hub** which aggregates the frames
from multiple applications and their instances. This allows centralised logging,
enforcement of blocking policies and further analysis of incoming traffic.

It requires the following options:

- `url`
- `siteId`
- `siteSecret`


#### Combining reporters

You can have a standard accesslog produced for the infrastructure team,
console output for developers and a web UI with basic analysis for everyone else.

```
const TrafficManagerAgent = require('traffic-manager-agent');

const trafficManagerOpts = {
  settings: {
    frameDurationSeconds: 15,
    customBlockedRequestMessage: 'If you think you should not be seeing this message please contact support@example.com'
  },

  reporters: [
    {
      type: 'event',
      output: 'stdout',
      format: 'apache',
      filter: { statusCode: 429 }  // only log blocked requests
    },

    {
      type: 'event',
      output: 'file',
      format: 'apache',
      location: `${__dirname}/../accesslog.log`
    },

    {
      type: 'frame',
      output: 'stdout',
      format: 'summary'
    },

    {
      type: 'frame',
      output: 'tmhub',
      url: 'https://trafficmanager.example.com',
      siteId: '2fb5193d923f4b71ad6a771e8700aa1f',
      siteSecret: 'ZSU5M2UyMGE5N2JjNDFmODkxMTVjNWViNjVmY2U0MGY='
    }
  ]
};

const trafficManagerMiddleware = TrafficManagerAgent(trafficManagerOpts);

app.use(trafficManagerMiddleware);
```
