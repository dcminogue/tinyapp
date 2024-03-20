const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const request = require("request");
app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

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

const verifyUser = function (email, password) {
    for (let key in users) {
        // Check if the email matches and then use bcrypt to compare the password
        if (
            users[key].email === email &&
            bcrypt.compareSync(password, users[key].password)
        ) {
            return key; // Return user's ID on successful match
        }
    }
    return null; // Return null if no matching user is found
};
// const verifyUser = function (email, password) {
//     for (let key in users) {
//         if (users[key].email === email && users[key].password === password)
//             return key; // Return user's ID on successful match
//     }
//     return null; // Return null if no matching user is found
// };

const idUserWithEmail = function (email) {
    for (let key in users) {
        if (users[key].email === email) {
            return users[key];
        }
    }
    return null;
};

const urlsForUser = function (id) {
    let usersUrls = {};
    for (let urlID in urlDatabase) {
        if (urlDatabase[urlID].userId === id) {
            usersUrls[urlID] = urlDatabase[urlID]; // Assign the whole URL object
        }
    }
    return usersUrls;
};

const urlDatabase = {
    b2xVn2: {
        id: "b2xVn2",
        longUrl: "http://www.lighthouselabs.ca",
        userId: "aJ48lW",
    },
    "9sm5xK": {
        id: "9sm5xK",
        longUrl: "http://www.google.com",
        userId: "aJ48lW",
    },
};

const users = {};

app.get("/urls/new", (req, res) => {
    if (!req.cookies["user_id"]) {
        return res.redirect("/login");
    }
    const templateVars = {
        user: users[req.cookies["user_id"]],
    };
    res.render("urls_new", templateVars);
});

app.post("/urls/:id", (req, res) => {
    const userID = req.cookies["user_id"];
    const urlID = req.params.id;

    // Check if the URL exists
    if (!urlDatabase[urlID]) {
        return res.status(404).send("URL not found.");
    }

    // Check if the user owns the URL
    if (urlDatabase[urlID].userID !== userID) {
        return res
            .status(403)
            .send("You do not have permission to edit this URL.");
    }

    // Proceed with URL update
    urlDatabase[urlID].longURL = req.body.longURL; // Assuming longURL is passed in the request body
    res.redirect("/urls");
});

app.get("/urls", (req, res) => {
    const userID = req.cookies["user_id"];
    if (!userID) {
        return res.redirect("/login");
    }

    const user = users[userID]; // Assuming 'users' is your user database

    const userSpecificUrls = urlsForUser(userID); // Filter the URLs for the logged-in user

    const templateVars = {
        urls: userSpecificUrls, // Use the filtered URLs
        user: user,
    };

    console.log("DB:", userSpecificUrls);
    res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
    const id = req.params.id;
    const longUrl = urlDatabase[id].longUrl;
    console.log(longUrl);
    if (longUrl) {
        res.redirect(longUrl); // If the long URL exists, redirect to it
    } else {
        res.status(404).send("URL not found"); // If not found, you could send a 404 error
    }
});

app.get("/urls/:id", (req, res) => {
    const id = req.params.id;
    const longUrl = urlDatabase[id].longUrl;
    const user = users[req.cookies.user_id];
    const templateVars = {
        id,
        longUrl,
        user,
    };
    res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
    if (!req.cookies["user_id"]) {
        return res.redirect("/login");
    }
    const id = generateRandomString(6);
    const longUrl = req.body.longURL;
    const userId = req.cookies.user_id;
    urlDatabase[id] = { id, longUrl, userId };
    console.log(urlDatabase);
    // urlDatabase.id = url; // Log the POST request body to the console
    res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
});

app.get("/login", (req, res) => {
    if (req.cookies.user_id) {
        return res.redirect("/urls");
    }
    console.log(req.query);
    const templateVars = {
        user: users[req.cookies["user_id"]],
        alert: "Log in to modify url.",
        path: req.query.origin,
    };
    res.render("login", templateVars);
});

// app.post("/urls/:id/delete", (req, res) => {
//     const userID = req.cookies["user_id"];
//     const urlID = req.params.id;
//     // Use DB to access the URLs, ensuring consistency with your DB structure.
//     const url = DB[urlID];

//     // Check if the URL exists
//     if (!url) {
//         return res.status(404).send("URL not found.");
//     }

//     // Check if the user owns the URL
//     if (url.userId !== userID) {
//         // Note: It's crucial to match the case of properties as defined in your DB
//         return res
//             .status(403)
//             .send("You do not have permission to delete this URL.");
//     }

//     // Proceed with URL deletion
//     delete DB[urlID];
//     res.redirect("/urls");
// });

app.post("/urls/:id/delete", (req, res) => {
    const userID = req.cookies["user_id"];
    const urlID = req.params.id;
    // Make sure the variable name matches how you've defined it elsewhere.
    const url = urlDatabase[urlID]; // Ensure consistent variable naming, assuming urlDatabase is the correct name.
    // Check if the URL exists
    if (!url) {
        return res.status(404).send("URL not found.");
    }

    // Check if the user owns the URL
    if (url.userId !== userID) {
        // Again, ensure the property names you are accessing exist on the object.
        return res
            .status(403)
            .send("You do not have permission to delete this URL.");
    }

    console.log("urlDatabase[urlID]", urlDatabase[urlID]);
    // Proceed with URL deletion
    delete urlDatabase[urlID];
    res.redirect("/urls");
});

// app.post("/urls/:id/delete", (req, res) => {
//     const userID = req.cookies["user_id"];
//     const urlID = req.params.id;
//     const url = urlsDatabase[urlId];
//     // Check if the user owns the URL
//     if (!url) {
//         return res.status(404).send("URL not found.");
//     }
//     if (urlDatabase[urlID].userID !== userID) {
//         return res
//             .status(403)
//             .send("You do not have permission to delete this URL.");
//     }

//     // Proceed with URL deletion
//     delete urlDatabase[urlID];
//     res.redirect("/urls");
// });

app.post("/urls/:id/update", (req, res) => {
    const id = req.params.id;
    urlDatabase[id].longUrl = req.body.newURL;

    res.redirect("/urls");
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const userId = verifyUser(email, password);
    if (userId) {
        // If verifyUser returns a valid userId, set user_id cookie and redirect
        res.cookie("user_id", userId);
        res.redirect("/urls");
    } else {
        // If verifyUser returns null, meaning no user was found or password didn't match
        res.status(403).send("Error: Incorrect email or password.");
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/login");
});

app.post("/register", (req, res) => {
    const id = generateRandomString(6);
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    if (!email || !password) {
        return res
            .status(400)
            .send("Email and password must be filled out to register");
    }
    if (idUserWithEmail(email)) {
        return res.status(400).send("Email already exists");
    }
    users[id] = {
        id: id,
        email: email,
        password: hashedPassword,
    };
    console.log("New user registered:", users[id]); // Debugging line to check user registration
    console.log("All registered users:", users);
    res.cookie("user_id", id);
    res.redirect("/urls");
});

app.get("/register", (req, res) => {
    if (req.cookies["user_id"]) {
        return res.redirect("/urls");
    }
    const templateVars = {
        user: users[req.cookies["user_id"]],
    };
    res.render("register", templateVars);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
