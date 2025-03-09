//NodeJS uses the CommonJS module system (i.e. the "require()")
//as opposed to ES6 modules (similar concept) but different syntax
const express = require("express");
const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
    const formData = req.body;
    console.log(`Form data: ${JSON.stringify(formData)}`);
    res.redirect("/main");
   });

app.get("/main", (req, res) => {
 res.render("main");
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


app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${port}`);
});