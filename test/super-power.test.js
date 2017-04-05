'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const config = require ('../config');
const SuperPowerModel = require('../api/models/super-power.model');
const should = chai.should();

chai.use(chaiHttp);

describe('Super powers', () => {
  beforeEach(done => {
    SuperPowerModel.remove({})
      .then(() => done());
  });

  describe('GET /super-powers', () => {
    it('should return 200 with an empty set of super powers', done => {
      chai.request(server)
        .get('/super-powers')
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it('should return 200 with a subset of super powers', done => {
      const superPowers = [];
      const limit = 1;
      Promise.resolve(new SuperPowerModel({ name: 'x-ray' }))
        .then(superPower => superPower.save())
        .then(superPower => {
          superPowers.push(superPower);
          return Promise
            .resolve(new SuperPowerModel({ name: 'adamantium claws' }))
        })
        .then(superPower => superPower.save())
        .then(superPower => superPowers.push(superPower))
        .then(() => {
          chai.request(server)
            .get('/super-powers')
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

    it('should return 200 with all super powers', done => {
      const superPowers = [];
      Promise.resolve(new SuperPowerModel({ name: 'x-ray' }))
        .then(superPower => superPower.save())
        .then(superPower => {
          superPowers.push(superPower);
          return Promise
            .resolve(new SuperPowerModel({ name: 'adamantium claws' }))
        })
        .then(superPower => superPower.save())
        .then(superPower => superPowers.push(superPower))
        .then(() => {
          chai.request(server)
            .get('/super-powers')
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(superPowers.length);
              done();
            });
        });
    });

    it('should return 400 with invalid content-type', done => {
      chai.request(server)
        .get('/super-powers')
        .set('content-type', 'text/plain')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be
            .eql(`Invalid content-type. Use '${config.contentType}'`);
          done();
        });
    });

    it('should return 400 with invalid page query param', done => {
      chai.request(server)
        .get('/super-powers')
        .query({ page: 'abc' })
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.a('array');
          res.body.errors.should.have.length(1);
          res.body.errors[0].should.have.property('msg');
          res.body.errors[0].msg.should.be
            .eql("Must be an integer with '1' as min value");
          done();
        });
    });

    it('should return 400 with invalid limit query param', done => {
      chai.request(server)
        .get('/super-powers')
        .query({ limit: -2 })
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.a('array');
          res.body.errors.should.have.length(1);
          res.body.errors[0].should.have.property('msg');
          res.body.errors[0].msg.should.be
            .eql("Must be an integer with '1' as min value");
          done();
        });
    });

    it('should return 404 with invalid method', done => {
      chai.request(server)
        .patch('/super-powers')
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be
            .eql("PATCH '/super-powers' not found");
          done();
        });
    });
  });
})
