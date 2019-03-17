# Traffic Manager Agent

Middleware in your Node application to collect the incoming requests.

## Integrating into Node app

1. Add agent module to your dependencies

```
npm install @cambridgecore/trafficmanager-agent --save
```

2. Register the middleware before other routes in your app

```
const TrafficManagerAgent = require('@cambridgecore/traffic-manager-agent');

const trafficManagerOpts = {
  reporters: {
    File: {
      enabled: true,
      format: 'apachecommon'
      location: './accesslog.log'
    },
    StdOut: {
      enabled: false
    },
    TrafficManagerHQ: {
      enabled: true,
      url: 'https://trafficmanager.example.com',
      siteId: '2fb5193d923f4b71ad6a771e8700aa1f',
      siteSecret: 'zN2EY69fmy303MUEs7ZkQv8sqeuFjFEp'
    }
  }
};

const trafficManagerMiddleware = TrafficManagerAgent(trafficManagerOpts);

app.use(trafficManagerMiddleware);
```

3. That's it - requests to your app are now measured.
