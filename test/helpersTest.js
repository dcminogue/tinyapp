const { assert } = require("chai");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const serverUrl = "http://localhost:8080";

const { getUserWithEmail } = require("../helpers.js");

const testUsers = {
    userRandomID: {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
    },
    user2RandomID: {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk",
    },
};

describe("getUserWithEmail", function () {
    it("should return a user object for a valid email", function () {
        const user = getUserWithEmail("user@example.com", testUsers);
        const expectedUserID = "userRandomID";
        assert.equal(
            user.id,
            expectedUserID,
            "It should return the user object with a matching ID."
        );
    });

    it("should return null for an email not in the database", function () {
        const user = getUserWithEmail("notfound@example.com", testUsers);
        assert.isNull(
            user,
            "It should return null for an email not found in the database."
        );
    });
});

describe("Login and Access Control Test", () => {
    it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
        const agent = chai.request.agent("http://localhost:8080");

        // Step 1: Login with valid credentials
        return agent
            .post("/login")
            .send({ email: "user2@example.com", password: "dishwasher-funk" })
            .then(loginRes => {
                // Step 2: Make a GET request to a protected resource
                return agent.get("/urls/b2xVn2").then(accessRes => {
                    // Step 3: Expect the status code to be 403
                    expect(accessRes).to.have.status(403);
                });
            });
    });
});

describe("Testing redirection and access control", () => {
    let agent;

    beforeEach(() => {
        // Initialize a new agent before each test
        agent = chai.request.agent(serverUrl);
    });

    afterEach(() => {
        // Close the agent after each test
        agent.close();
    });
    describe("Testing redirection and access control", () => {
        it('should redirect from "/" to "/login" with a status code of 302', () => {
            chai.request(serverUrl)
                .get("/")
                .end((err, res) => {
                    expect(res).to.redirectTo(`${serverUrl}/login`);
                    expect(res).to.have.status(302);
                    // done();
                });
        });

        it('should redirect from "/" to "/login" with a status code of 302', () => {
            agent.get("/").then(res => {
                expect(res).to.redirect;
                expect(res).to.redirectTo(`${serverUrl}/login`);
                // .to.have.status(302);
                expect(res).to.have.status(302);
                // done();
            });
        });

        it('should redirect from "/urls/new" to "/login" with a status code of 302', () => {
            agent.get("/urls/new").then(res => {
                expect(res).to.redirectTo(`${serverUrl}/login`);
                expect(res).to.have.status(302);
                // done();
            });
        });

        it("should respond to a GET request for a non-existent URL with a status code of 404", () => {
            chai.request(serverUrl)
                .get("/urls/NOTEXISTS")
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    // done();
                });
        });

        it("should respond to a GET request for an unauthorized URL with a status code of 403", () => {
            chai.request(serverUrl)
                .get("/urls/b2xVn2")
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    // done();
                });
        });
    });
});
