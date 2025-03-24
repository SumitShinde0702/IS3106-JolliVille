//NodeJS uses the CommonJS module system (i.e. the "require()")
//as opposed to ES6 modules (similar concept) but different syntax
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const { insertUser, getAllusers, deleteUser, updateUser, getUserById, getUserByEmail } = require("./lib/database");
const session = require("express-session");

// Use bodyParser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/login", (req, res) => {
    res.render("login");
    const formData = req.body;
    console.log(`Form data: ${JSON.stringify(formData)}`);
    res.redirect("/main");
   });

app.post("/dologin", async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await getUserByEmail(email);

    if(foundUser && foundUser.password === password) {
        req.session.userId = foundUser._id;
        res.redirect("/admin_manage_users"); //actually leads to main page
    } else {                                 // but for debug purposes
        res.redirect("/login");
    }                          
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/doregister", async (req, res) => {
    const { firstName, lastName, dob, email, password, confirmPassword } = req.body;

    // Password check
    if (password !== confirmPassword) {
        return res.send("Passwords do not match! Try again.");
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return res.send("User already exists! Please log in.");
    }

    // Insert new user
    await insertUser({ firstName, lastName, dob, email, password });
    res.redirect("/admin_manage_users"); //debug purpose, change to main 
});

app.get("/main", (req, res) => {
 res.render("main");
});

app.get("/", (req, res) => {
    res.render("landing_page");
   });

app.get("/settings", (req, res) => {
    res.render("settings");
});
  
app.get("/monthlylog", (req, res) => {
    res.render("monthly_log");
   });
   
   
app.get("/editVillage", (req, res) => {
    res.render("edit_village");
   });
   
app.get("/chatbot", (req, res) => {
    res.render("chatbot");
   });
   
app.get("/logJournal", (req, res) => {
    res.render("log_journal");
   });

app.get("/admin/manageUsers", async (req, res) => {
    try {
        const users = await getAllusers(); // Fetch users from database
        res.render("admin_manage_users", { users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false //setting this false for http connections
        },
    })
);




app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${port}`);
});