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

  describe('POST /users', () => {
    it('should return 201 with a valid user', done => {
      chai.request(server)
        .post('/users')
        .send({ username: 'Administrator', password: '123' })
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(201);
          res.headers.should.have.property('location');
          done();
        });
    });

    it('should return 400 without username', done => {
      chai.request(server)
        .post('/users')
        .send({ password: '123' })
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Username is required');
          done();
        });
    });

    it('should return 400 without password', done => {
      chai.request(server)
        .post('/users')
        .send({ username: 'user' })
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Password is required');
          done();
        });
    });

    it('should return 400 with invalid role', done => {
      chai.request(server)
        .post('/users')
        .send({ username: 'user', password: '123', roles: ['123'] })
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Invalid role id');
          done();
        });
    });

    it('should return 400 with invalid role', done => {
      chai.request(server)
        .post('/users')
        .send({ username: 'user', password: '123',
          roles: ['58e5131e634a8d13f059930a'] })
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Role does not exist');
          done();
        });
    });

    it('should return 422 with duplicated id', done => {
      Promise.resolve(new UserModel({ username: 'Administrator',
        password: '123' }))
        .then(user => user.save())
        .then(() => {
          chai.request(server)
            .post('/users')
            .send({ username: 'Administrator', password: 'abc' })
            .set('x-access-token', authStub.mockValidToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(422);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Duplicated user');
              done();
            });
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return 204 with valid id', done => {
      Promise.resolve(new UserModel({ username: 'Administrator',
        password: '123' }))
        .then(user => user.save())
        .then(user => {
          chai.request(server)
            .delete(`/users/${user._id}`)
            .set('x-access-token', authStub.mockValidToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(204);
              done();
            });
        });
    });

    it('should return 404 with invalid id', done => {
      chai.request(server)
        .delete('/users/invalid-id')
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('User not found');
          done();
        });
    });

    it('should return 404 with id that does not exist', done => {
      chai.request(server)
        .delete('/users/58e5131e634a8d13f059930d')
        .set('x-access-token', authStub.mockValidToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('User not found');
          done();
        });
    });
  });
})
