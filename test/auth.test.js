'use strict';

const bcrypt = require('bcrypt');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const config = require ('../config');
const UserModel = require('../api/models/user.model');
const should = chai.should();

chai.use(chaiHttp);

describe('Authentication', () => {
  beforeEach(done => {
    UserModel.remove({})
      .then(() => new UserModel({ username: 'admin', password: '123' }))
      .then(user =>
          Promise.all([user, bcrypt.hash(user.password, config.saltRounds)]))
      .then(results => {
        const [user, hash] = results;
        user.password = hash;
        return user.save();
      })
      .then(user => {
        this.user = user;
        return done();
      });
  });

  describe('POST /authenticate', () => {
    it('should return 200 with a token', done => {
      chai.request(server)
        .post('/authenticate')
        .set('content-type', 'application/json')
        .send({ username: this.user.username, password: '123' })
        .end((req, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          done();
        });
    });

    it('should return 404 with invalid user', done => {
      chai.request(server)
        .post('/authenticate')
        .set('content-type', 'application/json')
        .send({ username: 'john.doe' })
        .end((req, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('User not found');
          done();
        });
    });

    it('should return 401 with invalid password', done => {
      chai.request(server)
        .post('/authenticate')
        .set('content-type', 'application/json')
        .send({ username: this.user.username, password: 'abc' })
        .end((req, res) => {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.be.eql('Invalid username/password');
          done();
        });
    });
  });
})
