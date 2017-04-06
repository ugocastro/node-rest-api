'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const config = require ('../../config');
const ProtectionAreaModel = require('../../api/models/protection-area.model');
const SuperHeroModel = require('../../api/models/super-hero.model');
const SuperPowerModel = require('../../api/models/super-power.model')
const authStub = require('../stubs/auth.stub');
const should = chai.should();

chai.use(chaiHttp);

describe('Super heroes', () => {
  beforeEach(done => {
    ProtectionAreaModel.remove({})
      .then(() => SuperPowerModel.remove({}))
      .then(() => SuperHeroModel.remove({}))
      .then(() => done());
  });

  describe('GET /super-heroes', () => {
    it('should return 200 with an empty set of super heroes', done => {
      chai.request(server)
        .get('/super-heroes')
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it('should return 200 with a subset of super heroes', done => {
      const limit = 1;
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        latitude: 12.343, longitude: 35.978, radius: 5 }))
        .then(area => area.save())
        .then(area => {
          this.protectionArea = area;
          return new SuperPowerModel({ name: "Utilities' belt" });
        })
        .then(superPower => superPower.save())
        .then(superPower => {
          this.superPower = superPower;
          return new SuperHeroModel({ name: 'Batman', alias: 'Bruce Wayne',
            protectionArea: this.protectionArea._id, superPowers: [this.superPower._id] });
        })
        .then(superHero => superHero.save())
        .then(() => new SuperHeroModel({ name: 'Batman clone', alias: 'Bruce Wayne',
          protectionArea: this.protectionArea._id, superPowers: [this.superPower._id] }))
        .then(superHero => superHero.save())
        .then(() => {
          chai.request(server)
            .get('/super-heroes')
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

    it('should return 200 with all super heroes', done => {
      const superHeroes = [];
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        latitude: 12.343, longitude: 35.978, radius: 5 }))
        .then(area => area.save())
        .then(area => {
          this.protectionArea = area;
          return new SuperPowerModel({ name: "Utilities' belt" });
        })
        .then(superPower => superPower.save())
        .then(superPower => {
          this.superPower = superPower;
          return new SuperHeroModel({ name: 'Batman', alias: 'Bruce Wayne',
            protectionArea: this.protectionArea._id, superPowers: [this.superPower._id] });
        })
        .then(superHero => superHero.save())
        .then(superHero => {
          superHeroes.push(superHero);
          return new SuperHeroModel({ name: 'Batman clone', alias: 'Bruce Wayne',
            protectionArea: this.protectionArea._id, superPowers: [this.superPower._id] });
        })
        .then(superHero => superHero.save())
        .then(superHero => superHeroes.push(superHero))
        .then(() => {
          chai.request(server)
            .get('/super-heroes')
            .set('x-access-token', authStub.mockValidToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(superHeroes.length);
              done();
            });
        });
    });
  });
})
