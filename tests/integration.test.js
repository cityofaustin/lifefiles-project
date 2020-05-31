"use strict";

require("dotenv").config();

let chai = require("chai");
let request = require("supertest");
let use = require("chai").use;
let chaiEach = require("chai-each");
let should = require("chai").should();
chai.use(require("chai-like"));
chai.use(require("chai-things"));
use(chaiEach);

let expect = chai.expect;

let adminToken;
let nobodyAccountId;
let nobodyAccountToken;
let nobodyCaseworkerAccountId;
let nobodyCaseworkerAccountToken;

if (process.env.ENVIRONMENT !== "DEVELOPMENT") {
  console.log("Skipping Tests");
  return;
}

const passport = `${__dirname}/testFiles/passport.png`;

describe("Mypass Integration Tests", function() {
  describe("#User Flows", function() {
    it("should return document types", function(done) {
      request("http://localhost:5000/api/")
        .get("document-types/")
        .end(function(err, res) {
          expect(res.statusCode).to.equal(200);
          expect(
            res.body.should.have
              .property("documentTypes")
              .which.is.an("array")
              .that.contains.some.property("_id")
              .that.contains.some.property("isTwoSided")
              .that.contains.some.property("hasExpirationDate")
          );
          done();
        });
    });

    it("should login as admin", function(done) {
      request("http://localhost:5000/api/")
        .post("accounts/login")
        .send({
          account: {
            email: "admin@admin.com",
            password: process.env.ADMIN_PASSWORD,
          },
        })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(200);
          expect(
            res.body.should.have
              .property("account")
              .which.is.an("object")
              .that.contains.property("username")
              .that.equal("admin")
          );
          adminToken = res.body.account.token;
          done();
        });
    });

    it("should create nobody caseworker account", function(done) {
      request("http://localhost:5000/api/")
        .post("admin-accounts/")
        .send({
          account: {
            email: "nobodycw@nobodycw.com",
            password: process.env.ADMIN_PASSWORD,
            accounttype: "Intern",
            username: "nobodycw",
            firstname: "nocw",
            lastname: "bodycw",
            phonenumber: "555-555-5555",
            organization: "org",
          },
        })
        .set({ Authorization: `Bearer ${adminToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(201);

          expect(
            res.body.should.have
              .property("account")
              .which.is.an("object")
              .that.contains.property("didAddress")
              .which.is.an("string")
          );
          expect(
            res.body.should.have
              .property("account")
              .which.is.an("object")
              .that.contains.property("username")
              .that.equal("nobodycw")
          );

          nobodyCaseworkerAccountId = res.body.account.id;
          nobodyCaseworkerAccountToken = res.body.account.token;
          done();
        });
    });

    it("should create nobody owner account", function(done) {
      request("http://localhost:5000/api/")
        .post("admin-accounts/")
        .send({
          account: {
            email: "nobody@nobody.com",
            password: process.env.ADMIN_PASSWORD,
            accounttype: "Limited Owner",
            username: "nobody",
            firstname: "no",
            lastname: "body",
            phonenumber: "555-555-5555",
            organization: "org",
          },
        })
        .set({ Authorization: `Bearer ${adminToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(201);

          expect(
            res.body.should.have
              .property("account")
              .which.is.an("object")
              .that.contains.property("didAddress")
              .which.is.an("string")
          );
          expect(
            res.body.should.have
              .property("account")
              .which.is.an("object")
              .that.contains.property("username")
              .that.equal("nobody")
          );

          nobodyAccountId = res.body.account.id;
          nobodyAccountToken = res.body.account.token;
          done();
        });
    });

    it("should not be able to at create nobody account twice", function(done) {
      request("http://localhost:5000/api/")
        .post("admin-accounts/")
        .send({
          account: {
            email: "nobody@nobody.com",
            password: process.env.ADMIN_PASSWORD,
            accounttype: "Limited Owner",
            username: "nobody",
            firstname: "no",
            lastname: "body",
            phonenumber: "555-555-5555",
            organization: "org",
          },
        })
        .set({ Authorization: `Bearer ${adminToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(500);

          expect(
            res.body.should.have
              .property("msg")
              .which.is.an("object")
              .that.contains.property("message")
              .that.contains("username: is already taken.")
          );
          done();
        });
    });

    it("nobody should not be allowed to do anything", function(done) {
      // Start admin permissions
      request("http://localhost:5000/api/")
        .get("my-admin-account/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .post("admin-document-types/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .post("admin-document-types/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .put("admin-document-types/2342")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .delete("admin-document-types/2342")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .get("admin-account-types/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });
      request("http://localhost:5000/api/")
        .get("admin-view-features/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .delete("admin-accounts/234")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      // Start Permissions
      request("http://localhost:5000/api/")
        .get("account/:accountId/document-types/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .get("account/:accountId/share-requests/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .post("share-requests/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .put("share-requests/23423")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .delete("share-requests/23423")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      //WARNING -  Creates an eth transaction
      request("http://localhost:5000/api/")
        .post("anchor-vp-to-blockchain")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .post("documents")

        .attach("img", passport)
        .field("type", "passport")
        .field("encryptionPubKey", "234")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .put("documents/234")

        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .put("documents/234")

        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .post("account/:accountForId/documents/:documentType")

        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });

      request("http://localhost:5000/api/")
        .post("upload-document-on-behalf-of-user/")

        .set({ Authorization: `Bearer ${nobodyAccountToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(403);
        });
      done();
    });

    it("should delete nobody", function(done) {
      request("http://localhost:5000/api/")
        .delete(`admin-accounts/${nobodyAccountId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(200);
        });
      done();
    });

    it("should delete nobody caseworker", function(done) {
      request("http://localhost:5000/api/")
        .delete(`admin-accounts/${nobodyCaseworkerAccountId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(200);
        });
      done();
    });
  });
});
