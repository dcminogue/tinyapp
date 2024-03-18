const express = require("express");
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
        if (users[key].email === email && users[key].password === password)
            return key; // Return user's ID on successful match
    }
    return null; // Return null if no matching user is found
};

const idUserWithEmail = function (email) {
    for (let key in users) {
        if (users[key].email === email) {
            return users[key];
        }
    }
    return null;
};

const urlDatabase = {
    b2xVn2: "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
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

app.get("/urls/:id", (req, res) => {
    const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id],
        user: users[req.cookies["user_id"]],
    };
    res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
    const templateVars = {
        urls: urlDatabase,
        user: users[req.cookies["user_id"]],
    };
    res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
});

app.post("/urls", (req, res) => {
    if (!req.cookies["user_id"]) {
        return res.redirect("/login");
    }
    const id = generateRandomString(6);
    const url = req.body.longURL;
    urlDatabase[id] = url;
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

app.post("/urls/:id/delete", (req, res) => {
    if (!req.cookies["user_id"]) {
        return res.redirect(`/login?origin=modify`);
    }
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
    if (!req.cookies["user_id"]) {
        return res.redirect(`/login?origin=modify`);
    }
    const id = req.params.id;
    res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/update", (req, res) => {
    const id = req.params.id;
    urlDatabase[id] = req.body.newURL;

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
        password: password,
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
