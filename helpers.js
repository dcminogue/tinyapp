const bcrypt = require("bcryptjs");
const getUserWithEmail = function (email, users) {
    // Check if 'users' is an object and not null
    if (typeof users !== "object" || users === null) {
        throw new TypeError("'users' must be a non-null object");
    }
    // Check if 'email' is a string and not null
    if (typeof email !== "string" || email === null) {
        throw new TypeError("'email' must be a valid string.");
    }

    // The rest of your function...
    for (let key in users) {
        if (users[key].email === email) {
            return users[key];
        }
    }
    return null;
};

function generateRandomString(length) {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

const verifyUser = function (email, password, usersObj) {
    for (let key in usersObj) {
        // Check if the email matches and then use bcrypt to compare the password
        if (
            usersObj[key].email === email &&
            bcrypt.compareSync(password, usersObj[key].password)
        ) {
            return key; // Return user's ID on successful match
        }
    }
    return null; // Return null if no matching user is found
};

module.exports = {
    getUserWithEmail,
    generateRandomString,
    verifyUser,
};
