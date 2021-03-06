'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server').app;
const config = require ('../../config');
const ProtectionAreaModel = require('../../api/models/protection-area.model');
const SuperHeroModel = require('../../api/models/super-hero.model');
const SuperPowerModel = require('../../api/models/super-power.model');
const RoleModel = require('../../api/models/role.model');
const UserModel = require('../../api/models/user.model');
const authStub = require('../stubs/auth.stub');
const should = chai.should();

chai.use(chaiHttp);

describe('Super heroes', () => {
  before(done => {
    RoleModel.remove({})
      .then(() => new RoleModel({ _id: '58e5131e634a8d13f059930a', name: 'Admin' }))
      .then(role => role.save())
      .then(() => UserModel.remove({}))
      .then(() => new UserModel({ _id: '58e5131e634a8d13f059930c', username: 'admin',
        password: '$2a$10$Syj8AUP1Gts8rjWW.A4wLujZ54Wnag7SoF09hqEOmkuRSUdk9P4vC',
        roles:['58e5131e634a8d13f059930a'] }))
      .then(user => user.save())
      .then(() => done());
  });

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
        .set('x-access-token', authStub.mockAdminToken())
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
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
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

    it('should return 200 with all super heroes', done => {
      const superHeroes = [];
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
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
            .set('x-access-token', authStub.mockAdminToken())
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

  describe('GET /super-heroes/:id', () => {
    it('should return 200 with a valid id', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
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
          chai.request(server)
            .get(`/super-heroes/${superHero._id}`)
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('name');
              res.body.name.should.be.eql(superHero.name);
              done();
            });
        });
    });

    it('should return 404 with an invalid id', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
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
          chai.request(server)
            .get('/super-heroes/invalid-id')
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(404);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Super hero not found');
              done();
            });
        });
    });

    it('should return 404 with an id that does not exist', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
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
          chai.request(server)
            .get('/super-heroes/58e5131e634a8d13f059930b')
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(404);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Super hero not found');
              done();
            });
        });
    });
  });

  describe('POST /super-heroes', () => {
    it('should return 201 with a valid super hero', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => { this.protectionArea = area; })
        .then(() => {
          chai.request(server)
            .post('/super-heroes')
            .set('x-access-token', authStub.mockAdminToken())
            .send({ name: 'Batman', alias: 'Bruce Wayne',
              protectionArea: this.protectionArea._id })
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(201);
              res.headers.should.have.property('location');
              done();
            });
        });
    });

    it('should return 400 without name', done => {
      chai.request(server)
        .post('/super-heroes')
        .set('x-access-token', authStub.mockAdminToken())
        .send({ alias: 'Bruce Wayne' })
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Name is required');
          done();
        });
    });

    it('should return 400 without alias', done => {
      chai.request(server)
        .post('/super-heroes')
        .set('x-access-token', authStub.mockAdminToken())
        .send({ name: 'Batman' })
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Alias is required');
          done();
        });
    });

    it('should return 400 without protection area', done => {
      chai.request(server)
        .post('/super-heroes')
        .set('x-access-token', authStub.mockAdminToken())
        .send({ name: 'Superman', alias: 'Clark Kent' })
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Protection area is required');
          done();
        });
    });

    it('should return 400 with invalid protection area id', done => {
      chai.request(server)
        .post('/super-heroes')
        .set('x-access-token', authStub.mockAdminToken())
        .send({ name: 'Superman', alias: 'Clark Kent', protectionArea: 'invalid-id' })
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Invalid (protection area/super power) id');
          done();
        });
    });

    it('should return 400 with invalid super power id', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => { this.protectionArea = area; })
        .then(() => {
          chai.request(server)
            .post('/super-heroes')
            .set('x-access-token', authStub.mockAdminToken())
            .send({ name: 'Superman', alias: 'Clark Kent',
              protectionArea: this.protectionArea._id, superPowers: ['invalid-id'] })
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Invalid (protection area/super power) id');
              done();
            });
        });
    });

    it('should return 400 with protection area id that does not exist', done => {
      chai.request(server)
        .post('/super-heroes')
        .set('x-access-token', authStub.mockAdminToken())
        .send({ name: 'Superman', alias: 'Clark Kent',
          protectionArea: '58e5131e634a8d13f059930c' })
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('(Protection area/super power) does not exist');
          done();
        });
    });

    it('should return 400 with super power id that does not exist', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => { this.protectionArea = area; })
        .then(() => {
          chai.request(server)
            .post('/super-heroes')
            .set('x-access-token', authStub.mockAdminToken())
            .send({ name: 'Superman', alias: 'Clark Kent',
              protectionArea: this.protectionArea._id,
              superPowers: ['58e5131e634a8d13f059930c'] })
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('(Protection area/super power) does not exist');
              done();
            });
        });
    });

    it('should return 422 with duplicated super hero', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => { this.protectionArea = area; })
        .then(() => new SuperHeroModel({ name: 'Batman', alias: 'Bruce Wayne',
          protectionArea: this.protectionArea._id }))
        .then(superHero => superHero.save())
        .then(() => {
          chai.request(server)
            .post('/super-heroes')
            .set('x-access-token', authStub.mockAdminToken())
            .send({ name: 'Batman', alias: 'Clark Kent',
              protectionArea: this.protectionArea._id })
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(422);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Duplicated super hero');
              done();
            });
        });
    });
  });

  describe('DELETE /super-heroes/:id', () => {
    it('should return 204 with a valid id', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Gotham',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => { this.protectionArea = area; })
        .then(() => new SuperHeroModel({ name: 'Batman', alias: 'Bruce Wayne',
          protectionArea: this.protectionArea._id }))
        .then(superHero => superHero.save())
        .then(superHero => {
          chai.request(server)
            .delete(`/super-heroes/${superHero._id}`)
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
        .delete('/super-heroes/invalid-id')
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Super hero not found');
          done();
        });
    });

    it('should return 404 with an id that does not exist', done => {
      chai.request(server)
        .delete('/super-heroes/58e5131e634a8d13f059930c')
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Super hero not found');
          done();
        });
    });
  });

  describe('UPDATE /super-heroes/:id', () => {
    it('should return 204 with a new name', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Rain forest',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => new SuperHeroModel({ name: 'Wolverine', alias: 'Logan',
          protectionArea: area }))
        .then(superHero => superHero.save())
        .then(superHero => {
          chai.request(server)
            .put(`/super-heroes/${superHero._id}`)
            .send({ name: 'Cyclops' })
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(204);
              done();
            });
      });
    });

    it('should return 400 with _id being sent', done => {
      chai.request(server)
        .put('/super-heroes/58e6fe4a198a514f05a7a6d4')
        .send({ _id: 'abdffe4a198a514f05a7a271' })
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Id must not be sent on update');
          done();
        });
    });

    it('should return 400 with invalid protection area id', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Rain forest',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => new SuperHeroModel({ name: 'Wolverine', alias: 'Logan',
          protectionArea: area }))
        .then(superHero => superHero.save())
        .then(superHero => {
          chai.request(server)
            .put(`/super-heroes/${superHero._id}`)
            .send({ protectionArea: '123' })
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Invalid (protection area/super power) id');
              done();
            });
        });
    });

    it('should return 400 with invalid super power id', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Rain forest',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => new SuperHeroModel({ name: 'Wolverine', alias: 'Logan',
          protectionArea: area }))
        .then(superHero => superHero.save())
        .then(superHero => {
          chai.request(server)
            .put(`/super-heroes/${superHero._id}`)
            .send({ superPowers: ['123'] })
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Invalid (protection area/super power) id');
              done();
            });
        });
    });

    it('should return 400 with protection area id that does not exist', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Rain forest',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => new SuperHeroModel({ name: 'Wolverine', alias: 'Logan',
          protectionArea: area }))
        .then(superHero => superHero.save())
        .then(superHero => {
          chai.request(server)
            .put(`/super-heroes/${superHero._id}`)
            .send({ protectionArea: '58e6fe4a198a514f05a7a6d4' })
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('(Protection area/super power) does not exist');
              done();
            });
        });
    });

    it('should return 400 with super power id that does not exist', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Rain forest',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => new SuperHeroModel({ name: 'Wolverine', alias: 'Logan',
          protectionArea: area }))
        .then(superHero => superHero.save())
        .then(superHero => {
          chai.request(server)
            .put(`/super-heroes/${superHero._id}`)
            .send({ superPowers: '58e6fe4a198a514f05a7a6d4' })
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('(Protection area/super power) does not exist');
              done();
            });
        });
    });

    it('should return 404 with an invalid id', done => {
      chai.request(server)
        .put('/super-heroes/invalid-id')
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Super hero not found');
          done();
        });
    });

    it('should return 404 with an id that does not exist', done => {
      chai.request(server)
        .put('/super-heroes/58e6fe4a198a514f05a7a6d4')
        .send({ name: 'The Beast' })
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Super hero not found');
          done();
        });
    });

    it('should return 422 with duplicated super hero', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'NY',
        location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5 }))
        .then(area => area.save())
        .then(area => { this.protectionArea = area; })
        .then(() => new SuperHeroModel({ name: 'Flash', alias: 'Flash',
          protectionArea: this.protectionArea._id }))
        .then(superHero => superHero.save())
        .then(() => new SuperHeroModel({ name: 'Cyclops', alias: 'Cyclops',
          protectionArea: this.protectionArea._id }))
        .then(superHero => superHero.save())
        .then(superHero => {
          chai.request(server)
            .put(`/super-heroes/${superHero._id}`)
            .set('x-access-token', authStub.mockAdminToken())
            .send({ name: 'Flash' })
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(422);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Duplicated super hero');
              done();
            });
        });
    });
  });
})
