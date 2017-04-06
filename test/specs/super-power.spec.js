'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const config = require ('../../config');
const SuperPowerModel = require('../../api/models/super-power.model');
const SuperHeroModel = require('../../api/models/super-hero.model');
const ProtectionAreaModel = require('../../api/models/protection-area.model');
const RoleModel = require('../../api/models/role.model');
const authStub = require('../stubs/auth.stub');
const should = chai.should();

chai.use(chaiHttp);

describe('Super powers', () => {
  before(done => {
    RoleModel.remove({})
      .then(() => new RoleModel({ _id: '58e5131e634a8d13f059930a', name: 'Admin' }))
      .then(role => role.save())
      .then(() => done());
  });

  beforeEach(done => {
    SuperPowerModel.remove({})
      .then(() => done());
  });

  describe('GET /super-powers', () => {
    it('should return 200 with an empty set of super powers', done => {
      chai.request(server)
        .get('/super-powers')
        .set('x-access-token', authStub.mockAdminToken())
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
            .set('x-access-token', authStub.mockAdminToken())
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
            .set('x-access-token', authStub.mockAdminToken())
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
            .set('x-access-token', authStub.mockAdminToken())
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
            .set('x-access-token', authStub.mockAdminToken())
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
            .get(`/super-powers/${superPower._id.toString().replace(/.$/,"z")}`)
            .set('x-access-token', authStub.mockAdminToken())
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

  describe('POST /super-powers', () => {
    it('should return 201 with a valid super power', done => {
      chai.request(server)
        .post('/super-powers')
        .send({ name: 'x-ray' })
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(201);
          res.headers.should.have.property('location');
          done();
        });
    });

    it('should return 400 without name', done => {
      chai.request(server)
        .post('/super-powers')
        .send({ description: 'Very strong magical power' })
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Name is required');
          done();
        });
    });

    it('should return 422 with a duplicated name', done => {
      Promise.resolve(new SuperPowerModel({ name: 'adamantium claws' }))
        .then(superPower => superPower.save())
        .then(() => {
          chai.request(server)
            .post('/super-powers')
            .send({ name: 'adamantium claws' })
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(422);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Duplicated super power');
              done();
            });
      });
    });
  });

  describe('DELETE /super-powers/:id', () => {
    it('should return 204 with a valid id', done => {
      Promise.resolve(new SuperPowerModel({ name: 'explosive cards' }))
        .then(superPower => superPower.save())
        .then(superPower => {
          chai.request(server)
            .delete(`/super-powers/${superPower._id}`)
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(204);
              done();
            });
      });
    });

    it('should return 404 with an invalid id', done => {
      chai.request(server)
        .delete('/super-powers/invalid-id')
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Super power not found');
          done();
        });
    });

    it('should return 404 with an id that does not exist', done => {
      chai.request(server)
        .delete('/super-powers/58e5131e634a8d13f059930c')
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Super power not found');
          done();
        });
    });

    it('should return 422 with a super power associated with a super hero', done => {
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
        .then(() => {
          chai.request(server)
            .delete(`/super-powers/${this.superPower._id}`)
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(422);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Super power is associated to a super hero');
              done();
            });
        });
    });
  });
})
