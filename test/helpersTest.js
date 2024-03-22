const { assert } = require("chai");

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
