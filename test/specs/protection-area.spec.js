'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const config = require ('../../config');
const ProtectionAreaModel = require('../../api/models/protection-area.model');
const authStub = require('../stubs/auth.stub');
const should = chai.should();

chai.use(chaiHttp);

describe('Protection areas', () => {
  beforeEach(done => {
    ProtectionAreaModel.remove({})
      .then(() => done());
  });

  describe('GET /protection-areas', () => {
    it('should return 200 with an empty set of protection areas', done => {
      chai.request(server)
        .get('/protection-areas')
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it('should return 200 with a subset of protection areas', done => {
      const areas = [];
      const limit = 1;
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        latitude: 23.123, longitude: 12.817, radius: 5 }))
        .then(area => area.save())
        .then(area => {
          areas.push(area);
          return Promise
            .resolve(new ProtectionAreaModel({ name: 'New York',
              latitude: 22.154, longitude: 36.357, radius: 10 }))
        })
        .then(area => area.save())
        .then(area => areas.push(area))
        .then(() => {
          chai.request(server)
            .get('/protection-areas')
            .set('x-access-token', authStub.mockValidToken())
            .query({ limit })
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(limit);
              done();
            });
        });
    });

    it('should return 200 with all protection areas', done => {
      const areas = [];
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        latitude: 23.123, longitude: 12.817, radius: 5 }))
        .then(area => area.save())
        .then(area => {
          areas.push(area);
          return Promise
            .resolve(new ProtectionAreaModel({ name: 'New York',
              latitude: 22.154, longitude: 36.357, radius: 10 }))
        })
        .then(area => area.save())
        .then(area => areas.push(area))
        .then(() => {
          chai.request(server)
            .get('/protection-areas')
            .set('x-access-token', authStub.mockValidToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(areas.length);
              done();
            });
        });
    });
  });
})
