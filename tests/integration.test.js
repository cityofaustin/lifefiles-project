"use strict";

require("dotenv").config();

const request = require("supertest");
let adminToken;
let nobodyAccountId;
let nobodyAccountToken;
let nobodyCaseworkerAccountId;
let nobodyCaseworkerAccountToken;

if (process.env.ENVIRONMENT !== "DEVELOPMENT") {
  console.log("Skipping Tests");
  exit;
}

const passport = `${__dirname}/testFiles/passport.png`;

describe("Mypass Integration Tests", () => {
  describe("#User Flows", () => {
    it("should return document types", async () => {
      request("http://localhost:5000/api/")
        .get("document-types/")
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(Array.isArray(res.body.documentTypes)).toBeTruthy();
          expect(res.body.documentTypes[0]._id).toBeTruthy();
          expect(res.body.documentTypes[0].isTwoSided).toBeTruthy();
          expect(res.body.documentTypes[0].hasExpirationDate).toBeTruthy();
        });
    });

    it("should login as admin", async () => {
      const res = await request("http://localhost:5000/api/")
        .post("accounts/login")
        .send({
          account: {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
          },
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.account).toBeTruthy();
      expect(res.body.account.username).toBe("admin");
      expect(res.body.account.token).toBeTruthy();
      adminToken = res.body.account.token;
    });

    it("should create nobody caseworker account", async () => {
      const res = await request("http://localhost:5000/api/")
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
        .set({ Authorization: `Bearer ${adminToken}` });
      expect(res.statusCode).toBe(201);
      expect(res.body.account.didAddress).toBeTruthy();
      expect(res.body.account.id).toBeTruthy();
      expect(res.body.account.token).toBeTruthy();
      expect(res.body.account.username).toBe("nobodycw");
      nobodyCaseworkerAccountId = res.body.account.id;
      nobodyCaseworkerAccountToken = res.body.account.token;
    });

    it("should create nobody owner account", async () => {
      const res = await request("http://localhost:5000/api/")
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
        .set({ Authorization: `Bearer ${adminToken}` });
      expect(res.statusCode).toBe(201);
      expect(res.body.account.didAddress).toBeTruthy();
      expect(res.body.account.id).toBeTruthy();
      expect(res.body.account.token).toBeTruthy();
      expect(res.body.account.username).toBe("nobody");
      nobodyAccountId = res.body.account.id;
      nobodyAccountToken = res.body.account.token;
    });

    // NOTE: this doesn't 500
    xit("should not be able to at create nobody account twice", () => {
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
        .end((err, res) => {
          expect(res.statusCode).toBe(500);
          expect(
            res.body.msg.message.includes("username: is already taken.")
          ).toBeTruthy();
        });
    });

    it("nobody should not be allowed to do anything", async () => {
      // Start admin permissions
      let res = await request("http://localhost:5000/api/")
        .get("my-admin-account/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .post("admin-document-types/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .post("admin-document-types/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .put("admin-document-types/2342")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .delete("admin-document-types/2342")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .get("admin-account-types/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);
      res = await request("http://localhost:5000/api/")
        .get("admin-view-features/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .delete("admin-accounts/234")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      // Start Permissions
      res = await request("http://localhost:5000/api/")
        .get("account/:accountId/document-types/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .get("account/:accountId/share-requests/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .post("share-requests/")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .put("share-requests/23423")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .delete("share-requests/23423")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      //WARNING -  Creates an eth transaction
      res = await request("http://localhost:5000/api/")
        .post("anchor-vp-to-blockchain")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .post("documents")

        .attach("img", passport)
        .field("type", "passport")
        .field("encryptionPubKey", "234")
        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .put("documents/234")

        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .put("documents/234")

        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .post("account/:accountForId/documents/:documentType")

        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);

      res = await request("http://localhost:5000/api/")
        .post("upload-document-on-behalf-of-user/")

        .set({ Authorization: `Bearer ${nobodyAccountToken}` });
      expect(res.statusCode).toBe(403);
    });

    it("should delete nobody", () => {
      request("http://localhost:5000/api/")
        .delete(`admin-accounts/${nobodyAccountId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
        });
    });

    it("should delete nobody caseworker", () => {
      request("http://localhost:5000/api/")
        .delete(`admin-accounts/${nobodyCaseworkerAccountId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
        });
    });
  });
});
