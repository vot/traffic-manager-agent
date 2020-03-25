'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const createSampleFromRequest = require('./createSampleFromRequest');

const samples = [
  {
    req: {
      url: '/something/wp-login.php',
      session: {
        id: 'asdf'
      },
      connection: {
        remoteAddress: '1.2.3.4'
      },
      headers: {
        'user-agent': 'Agent Test'
      }
    },
    expected: {
      ip: '1.2.3.4',
      userAgent: 'Agent Test',
      url: '/something/wp-login.php',
      sessionId: 'asdf',
      // status: 0,
      // responseSize: 0,
      // timeProcessing: 0,
      // timestamp: 0,
    }
  },
];

describe('createSampleFromRequest util', () => {
  _.each(samples, (sample) => {
    it('should map an incomplete request object to a sample', () => {
      const result = createSampleFromRequest(sample.req, {});
      _.each(Object.keys(sample.expected), (key) => {
        expect(result[key]).to.equal(sample.expected[key]);
      });
    });
  });
});
