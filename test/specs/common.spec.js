'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const config = require ('../../config');
const authStub = require('../stubs/auth.stub');
const RoleModel = require('../../api/models/role.model');
const should = chai.should();

chai.use(chaiHttp);

describe('Common scenarios', () => {
  before(done => {
    RoleModel.remove({})
      .then(() => new RoleModel({ _id: '58e5131e634a8d13f059930a', name: 'Admin' }))
      .then(role => role.save())
      .then(() => done());
  });

  it('should return 400 with invalid content-type', done => {
    chai.request(server)
      .get('/super-powers')
      .set('x-access-token', authStub.mockAdminToken())
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
      .get('/protection-areas')
      .set('x-access-token', authStub.mockAdminToken())
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
      .get('/protection-areas')
      .set('x-access-token', authStub.mockAdminToken())
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

  it('should return 401 without access token', done => {
    chai.request(server)
      .get('/super-powers')
      .set('content-type', 'application/json')
      .end((req, res) => {
        res.should.have.status(401);
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        res.body.error.should.be
          .eql('User is not authenticated');
        done();
      });
  });

  it('should return 401 with invalid access token', done => {
    chai.request(server)
      .get('/super-powers')
      .set('x-access-token', authStub.mockInvalidToken())
      .set('content-type', 'application/json')
      .end((req, res) => {
        res.should.have.status(401);
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        res.body.error.should.be
          .eql('Invalid access token');
        done();
      });
  });

  it('should return 403 with standard token', done => {
    chai.request(server)
      .get('/users')
      .set('x-access-token', authStub.mockStandardToken())
      .set('content-type', 'application/json')
      .end((req, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        res.body.error.should.be
          .eql('User does not have permission to access this route');
        done();
      });
  });

  it('should return 404 with invalid method', done => {
    chai.request(server)
      .patch('/super-powers')
      .set('x-access-token', authStub.mockAdminToken())
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
