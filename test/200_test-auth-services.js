var chai = require("chai"),
    assert = chai.assert,
    expect = chai.expect,
    should = chai.should()
    q = require("q");

describe("Testing Auth Services", function() {
  var req, res = null;

  before(function(done) {
    var manager = require("./../lib/encryption-manager");

    q.all([manager.hash(global.test.admin.password), manager.hash(global.test.client.secret)])
      .then(function(result) {

        var User = require("./../lib/models/auth/user");
        var Client = require("./../lib/models/auth/client");

        var admin = new User();

        admin.name = global.test.admin.name;
        admin.email = global.test.admin.email;
        admin.sms = global.test.adminsms;
        admin.password = result[0];
        admin.isadmin = true;

        admin.save(function(err) {
          if (err) {
            done(err);
          }

          else {
            global.test.admin.id = admin._id;

            var client = new Client();

            client.name = global.test.client.name;
            client.secret = result[1];
            client.grants = global.test.client.grants;
            client.contact = admin._id;

            client.save(done);
          }
        });
      })
      .catch(function(err) {
        done(err);
      })

    req = {};
    res = {
      locals: {}
    }
  });

  describe("Session Service", function() {
    var SessionService = require("./../lib/services/auth/session-svc");
    var service = null;

    beforeEach(function() {
      service = new SessionService(req, res);
    });

    it("should have an getClient function", function() {
      service.getClient.should.be.instanceOf(Function);
    });

    it("should be able to successfully load a client", function(done) {
      q.when(service.getClient(global.test.client.name, global.test.client.secret))
        .then(function(client) {
          expect(client).to.not.be.empty;
          done();
        })
        .catch(function(err) {
          done(err);
        })
    });

    it("should have an authenticate function", function() {
      service.authenticate.should.be.instanceOf(Function);
    });

    it("should be able to successfully authenticate a user", function(done) {
      q.when(service.authenticate(global.test.admin.email, global.test.admin.password))
        .then(function(user) {
          expect(user).to.not.be.empty;
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });

    it("should have a getCurrentClient function", function() {
      service.getCurrentClient.should.be.instanceOf(Function);
    });

    it("should have a current user", function() {
      return expect(service.getCurrentUser()).to.not.be.empty;
    });

    it("should have a the right current user", function() {
      return expect(service.getCurrentUser().name).to.equal(global.test.admin.name);
    });

    it("should have a saveAccessToken function", function() {
      service.saveAccessToken.should.be.instanceOf(Function);
    });

    it("should be able to save an access token", function(done) {
      q.when(service.saveAccessToken("a-generated-access-token", new Date(2100, 01, 01)))
        .then(function() {
          done();
        })
        .catch(function(err) {
          done(err);
        })
    });

    it("should have a validate function", function() {
      service.validate.should.be.instanceOf(Function);
    });

    it("should be able to validate an access token", function(done) {
      q.when(service.validate("a-generated-access-token"))
        .then(function(token) {
          expect(token).to.not.be.empty;
          token.token.should.equal("a-generated-access-token");
          done();
        })
        .catch(function(err) {
          done(err);
        })
    });

    it("should have a saveRefreshToken function", function() {
      service.saveAccessToken.should.be.instanceOf(Function);
    });

    it("should be able to save a refresh token", function(done) {
      q.when(service.saveRefreshToken("a-generated-refresh-token", new Date(2100, 01, 01)))
        .then(function() {
          done();
        })
        .catch(function(err) {
          done(err);
        })
    });

    it("should have a refresh function", function() {
      service.refresh.should.be.instanceOf(Function);
    });

    it("should be able to refresh an access token", function(done) {
      q.when(service.refresh("a-generated-refresh-token"))
        .then(function(token) {
          expect(token).to.not.be.empty;
          token.token.should.equal("a-generated-refresh-token");
          done();
        })
        .catch(function(err) {
          done(err);
        })
    });

    it("should have a revoke function", function() {
      service.revoke.should.be.instanceOf(Function);
    });

    it("should be able to revoke a refresh token", function(done) {
      q.when(service.revoke("a-generated-refresh-token"))
        .then(function() {
          done();
        })
        .catch(function(err) {
          done(err);
        })
    });
  });

  describe("User Service", function() {
    var UserService = require("./../lib/services/auth/user-svc");
    var service = null;

    before(function(done) {

      var SessionService = require("./../lib/services/auth/session-svc");
      var service = new SessionService(req, res);

      q.when(service.authenticate(global.test.admin.email, global.test.admin.password))
        .then(function() {
          done();
        })
        .catch(function(err) {
          done(err);
        })
    });

    beforeEach(function() {
      service = new UserService(req, res);
    });

    it("should have a getUsers function", function() {
      service.getUsers.should.be.instanceOf(Function);
    });

    it("should be able to getUsers", function(done) {
      q.when(service.getUsers())
        .then(function(users) {
          expect(users).to.not.be.empty;
          done();
        })
        .catch(function(err) {
          done(err);
        })
    });

    it("should have a getUser function", function() {
      service.getUser.should.be.instanceOf(Function);
    });

    it("should be able to get a user by their id", function(done) {
      q.when(service.getUser(global.test.admin.id))
        .then(function(user) {
          expect(user).to.exist;
          expect(user.id).to.not.be.empty;
          expect(user.name).to.equal(global.test.admin.name);
          done();
        })
        .catch(function(err) {
          done(err);
        })
    });

    it("should have an addUser function", function() {
      service.addUser.should.be.instanceOf(Function);
    });

    it("should be able to add a new user", function(done) {
      q.when(service.addUser(global.test.user.name, global.test.user.email,  global.test.user.sms,  global.test.user.password))
        .then(function(user) {
          expect(user).to.exist;
          expect(user.id).to.not.be.empty;
          expect(user.name).to.equal(global.test.user.name);
          expect(user.email).to.equal(global.test.user.email);
          expect(user.sms).to.equal(global.test.user.sms || '');
          done();
        })
        .catch(function(err) {
          done(err);
        })
    });

    it.skip("shouldn't add a new user without the correct parameters", function(done) {
      q.when(service.addUser())
        .then(function(user) {
          done(user);
        })
        .catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal(400);
          expect(err.errors).to.not.be.empty;

          try {

            expect(err.errors).to.contain.all.members([
              "Name is required.",
              "Email is required.",
              "Password must be at least 6 characters.",
              "Password must contain at least 1 uppercase letter.",
              "Password must contain at least 1 lowercase letter.",
              "Password must contain at least 1 digit.",
              "Password must contain at least 1 symbol."
              ]);

            done();
          }
          catch(error) {
            console.error(err.errors);
            done(error);
          }
        })
    });

  })
});
