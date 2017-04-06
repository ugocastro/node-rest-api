'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const config = require ('../../config');
const RoleModel = require('../../api/models/role.model');
const UserModel = require('../../api/models/user.model')
const authStub = require('../stubs/auth.stub');
const should = chai.should();

chai.use(chaiHttp);

describe('Users', () => {
  beforeEach(done => {
    RoleModel.remove({})
      .then(() => UserModel.remove({}))
      .then(() => done());
  });

  describe('GET /users', () => {
    it('should return 200 with an empty set of users', done => {
      chai.request(server)
        .get('/users')
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it('should return 200 with a subset of users', done => {
      const limit = 1;
      Promise.resolve(new RoleModel({ name: 'Admin' }))
        .then(role => role.save())
        .then(role => {
          this.role = role;
          return new UserModel({ username: 'Administrator', password: '123',
            roles: [this.role._id]});
        })
        .then(user => user.save())
        .then(() => new UserModel({ username: 'Admin', password: 'abc',
          roles: [this.role._id]}))
        .then(user => user.save())
        .then(() => {
          chai.request(server)
            .get('/users')
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

    it('should return 200 with all users', done => {
      const users = [];
      Promise.resolve(new RoleModel({ name: 'Admin' }))
        .then(role => role.save())
        .then(role => {
          this.role = role;
          return new UserModel({ username: 'Administrator', password: '123',
            roles: [this.role._id]});
        })
        .then(user => user.save())
        .then(user => {
          users.push(user);
          return new UserModel({ username: 'Admin', password: 'abc',
            roles: [this.role._id]});
        })
        .then(user => user.save())
        .then(user => users.push(user))
        .then(() => {
          chai.request(server)
            .get('/users')
            .set('x-access-token', authStub.mockValidToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(users.length);
              done();
            });
        });
    });
  });
})
