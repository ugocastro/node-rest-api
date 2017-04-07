'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server').app;
const config = require ('../../config');
const authStub = require('../stubs/auth.stub');
const RoleModel = require('../../api/models/role.model');
const UserModel = require('../../api/models/user.model');
const ProtectionAreaModel = require('../../api/models/protection-area.model');
const SuperHeroModel = require('../../api/models/super-hero.model');
const SuperPowerModel = require('../../api/models/super-power.model');
const should = chai.should();

chai.use(chaiHttp);

describe('Help me', () => {
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

  describe('GET /help-me', () => {
    it('should return 200 with super heroes', done => {
      Promise.resolve(new ProtectionAreaModel({ name: 'Sé',
        location: { type: 'Point', coordinates: [-46.633677, -23.55072] }, radius: 5 }))
        .then(area => area.save())
        .then(area => {
          this.protectionArea = area;
          return new SuperPowerModel({ name: "x-ray" });
        })
        .then(superPower => superPower.save())
        .then(superPower => {
          return new SuperHeroModel({ name: 'Cyclops', alias: 'Cyclops',
            protectionArea: this.protectionArea._id, superPowers: [superPower._id] });
        })
        .then(superHero => superHero.save())
        .then(() => new ProtectionAreaModel({ name: 'Penha',
          location: { type: 'Point', coordinates: [-46.543983, -23.533544] }, radius: 5 }))
          .then(area => area.save())
          .then(area => {
            this.protectionArea = area;
            return new SuperPowerModel({ name: "adamantium-claws" });
          })
          .then(superPower => superPower.save())
          .then(superPower => {
            return new SuperHeroModel({ name: 'Wolverine', alias: 'Logan',
              protectionArea: this.protectionArea._id, superPowers: [superPower._id] });
          })
          .then(superHero => superHero.save())
          .then(() => {
            chai.request(server)
              .get('/help-me')
              .query({
                latitude: -23.522500,
                longitude: -46.558527
              })
              .set('x-access-token', authStub.mockAdminToken())
              .set('content-type', 'application/json')
              .end((req, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(2);
                done();
              });
          });
    });

    it('should return 400 with query params error', done => {
      chai.request(server)
        .get('/help-me')
        .query({
          latitude: -23.522500
        })
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.a('array');
          res.body.errors.length.should.be.eql(2);
          done();
        });
    });
  });
});
