'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server').app;
const config = require ('../../config');
const RoleModel = require('../../api/models/role.model');
const UserModel = require('../../api/models/user.model')
const authStub = require('../stubs/auth.stub');
const should = chai.should();

chai.use(chaiHttp);

describe('Users', () => {
  before(done => {
    RoleModel.remove({})
      .then(() => new RoleModel({ _id: '58e5131e634a8d13f059930a', name: 'Admin' }))
      .then(role => role.save())
      .then(role => {
        this.role = role;
      })
      .then(() => UserModel.remove({}))
      .then(() => new UserModel({ _id: '58e5131e634a8d13f059930c', username: 'admin',
        password: '$2a$10$Syj8AUP1Gts8rjWW.A4wLujZ54Wnag7SoF09hqEOmkuRSUdk9P4vC',
        roles:['58e5131e634a8d13f059930a'] }))
      .then(user => user.save())
      .then(() => done());
  });

  beforeEach(done => {
    UserModel.remove({ _id: {$ne: '58e5131e634a8d13f059930c'} })
      .then(() => done());
  });

  describe('GET /users', () => {
    it('should return 200 with a subset of users', done => {
      const limit = 1;
      Promise.resolve(new UserModel({ username: 'johndoe', password: '123',
          roles: [this.role._id]}))
        .then(user => user.save())
        .then(() => new UserModel({ username: 'doejohn', password: 'abc',
          roles: [this.role._id]}))
        .then(user => user.save())
        .then(() => {
          chai.request(server)
            .get('/users')
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

    it('should return 200 with all users', done => {
      const users = [];
      Promise.resolve(new UserModel({ username: 'johndoe', password: '123',
          roles: [this.role._id]}))
        .then(user => user.save())
        .then(user => {
          users.push(user);
          return new UserModel({ username: 'doejohn', password: 'abc',
            roles: [this.role._id]});
        })
        .then(user => user.save())
        .then(user => users.push(user))
        .then(() => {
          chai.request(server)
            .get('/users')
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(users.length + 1);
              done();
            });
        });
    });
  });

  describe('POST /users', () => {
    it('should return 201 with a valid user', done => {
      chai.request(server)
        .post('/users')
        .send({ username: 'jonhdoe', password: '123' })
        .set('x-access-token', authStub.mockAdminToken())
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
        .set('x-access-token', authStub.mockAdminToken())
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
        .set('x-access-token', authStub.mockAdminToken())
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
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Invalid role id');
          done();
        });
    });

    it('should return 400 with role that does not exist', done => {
      chai.request(server)
        .post('/users')
        .send({ username: 'user', password: '123',
          roles: ['58e5131e634a8d13f059930f'] })
        .set('x-access-token', authStub.mockAdminToken())
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
      Promise.resolve(new UserModel({ username: 'johndoe',
        password: '123' }))
        .then(user => user.save())
        .then(() => {
          chai.request(server)
            .post('/users')
            .send({ username: 'johndoe', password: 'abc' })
            .set('x-access-token', authStub.mockAdminToken())
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
      Promise.resolve(new UserModel({ username: 'johndoe',
        password: '123' }))
        .then(user => user.save())
        .then(user => {
          chai.request(server)
            .delete(`/users/${user._id}`)
            .set('x-access-token', authStub.mockAdminToken())
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
        .set('x-access-token', authStub.mockAdminToken())
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
        .set('x-access-token', authStub.mockAdminToken())
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

  describe('UPDATE /users/:id', () => {
    it('should return 204 with a new username', done => {
      Promise.resolve(new UserModel({ username: 'johndoe',
        password: '123' }))
        .then(user => user.save())
        .then(user => {
          chai.request(server)
            .put(`/users/${user._id}`)
            .send({ username: 'doejohn' })
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(204);
              done();
            });
      });
    });

    it('should return 204 with a new password', done => {
      Promise.resolve(new UserModel({ username: 'johndoe',
        password: '123' }))
        .then(user => user.save())
        .then(user => {
          chai.request(server)
            .put(`/users/${user._id}`)
            .send({ password: 'abc' })
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
        .put('/users/58e6fe4a198a514f05a7a6d4')
        .send({ _id: '1906fe4a198a514f05a7a2bc' })
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

    it('should return 400 with invalid role', done => {
      Promise.resolve(new UserModel({ username: 'johndoe',
        password: '123' }))
        .then(user => user.save())
        .then(user => {
          chai.request(server)
            .put(`/users/${user._id}`)
            .send({ roles: ['123'] })
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Invalid role id');
              done();
            });
        });
    });

    it('should return 400 with role that does not exist', done => {
      Promise.resolve(new UserModel({ username: 'johndoe',
        password: '123' }))
        .then(user => user.save())
        .then(user => {
          chai.request(server)
            .put(`/users/${user._id}`)
            .send({ roles: ['58e5131e634a8d13f059930f'] })
            .set('x-access-token', authStub.mockAdminToken())
            .set('content-type', 'application/json')
            .end((req, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
              res.body.error.should.be.eql('Role does not exist');
              done();
            });
        });
    });

    it('should return 404 with an invalid id', done => {
      chai.request(server)
        .put('/users/invalid-id')
        .set('x-access-token', authStub.mockAdminToken())
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
        .put('/users/1906fe4a198a514f05a7a2bc')
        .send({ username: 'johndoe' })
        .set('x-access-token', authStub.mockAdminToken())
        .set('content-type', 'application/json')
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('User not found');
          done();
        });
    });

    it('should return 422 with duplicated id', done => {
      Promise.resolve(new UserModel({ username: 'johndoe',
        password: '123' }))
        .then(user => user.save())
        .then(() => new UserModel({ username: 'doejohn',
          password: 'abc' }))
        .then(user => user.save())
        .then(user => {
          chai.request(server)
            .put(`/users/${user._id}`)
            .send({ username: 'johndoe' })
            .set('x-access-token', authStub.mockAdminToken())
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
})
