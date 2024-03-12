const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
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

const urlDatabase = {
    b2xVn2: "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
};

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
    const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id],
    };
    res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
});

app.post("/urls", (req, res) => {
    const id = generateRandomString(6);
    const url = req.body.longURL;
    urlDatabase[id] = url;
    // urlDatabase.id = url; // Log the POST request body to the console
    res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
    const id = req.params.id;
    res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/update", (req, res) => {
    const id = req.params.id;
    urlDatabase[id] = req.body.newURL;

    res.redirect("/urls");
});

app.post("/login", (req, res) => {
    const { username } = req.body;
    res.cookie("username", username);
    res.redirect("/urls");
});

app.get("/", (req, res) => {
    res.send("Hello!");
});

// app.get("/urls.json", (req, res) => {
//     res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//     res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//     const a = 1;
//     res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//     const a = 1;
//     res.send(`a = ${a}`);
// });

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
