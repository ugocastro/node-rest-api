'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const config = require ('../../config');
const SuperPowerModel = require('../../api/models/super-power.model');
const authStub = require('../stubs/auth.stub');
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
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it('should return 200 with a subset of super powers', done => {
      const limit = 1;
      Promise.resolve(new SuperPowerModel({ name: 'x-ray' }))
        .then(superPower => superPower.save())
        .then(superPower => new SuperPowerModel({ name: 'adamantium claws' }))
        .then(superPower => superPower.save())
        .then(() => {
          chai.request(server)
            .get('/super-powers')
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

    it('should return 200 with all super powers', done => {
      const superPowers = [];
      Promise.resolve(new SuperPowerModel({ name: 'x-ray' }))
        .then(superPower => superPower.save())
        .then(superPower => {
          superPowers.push(superPower);
          return new SuperPowerModel({ name: 'adamantium claws' });
        })
        .then(superPower => superPower.save())
        .then(superPower => superPowers.push(superPower))
        .then(() => {
          chai.request(server)
            .get('/super-powers')
            .set('x-access-token', authStub.mockValidToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(superPowers.length);
              done();
            });
        });
    });
  });

  describe('GET /super-powers/:id', () => {
    it('should return 200 with a valid id', done => {
      Promise.resolve(new SuperPowerModel({ name: 'x-ray' }))
        .then(superPower => superPower.save())
        .then(superPower => {
          chai.request(server)
            .get(`/super-powers/${superPower._id}`)
            .set('x-access-token', authStub.mockValidToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('name');
              res.body.name.should.be.eql(superPower.name);
              done();
            });
        });
    });

    it('should return 404 with an invalid id', done => {
      Promise.resolve(new SuperPowerModel({ name: 'x-ray' }))
        .then(superPower => superPower.save())
        .then(superPower => {
          chai.request(server)
            .get(`/super-powers/invalid-id`)
            .set('x-access-token', authStub.mockValidToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(404);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Super power not found');
              done();
            });
        });
    });

    it('should return 404 with an id that does not exist', done => {
      Promise.resolve(new SuperPowerModel({ name: 'x-ray' }))
        .then(superPower => superPower.save())
        .then(superPower => {
          chai.request(server)
            .get(`/super-powers/${superPower._id.toString().replace(/.$/,"0")}`)
            .set('x-access-token', authStub.mockValidToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(404);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Super power not found');
              done();
            });
        });
    });
  });
})
