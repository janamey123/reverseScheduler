const express = require("express");
const mysql = require("mysql");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js

// routes
app.get("/", function (req, res) {
    res.render("index");
});
app.get("/signUp", function (req, res) {
    res.render("signUp");
});
app.get("/signingUpRequest", async function (req, res) {
    let user = await getUser(req.query);
    res.render("signUp", {"u": user});
});

function getUser(query) {
    // connect to database here to check if user already exists
    let userName = query.userName;
    let firstName = query.firstName;
    let lastName = query.lastName;
    let password = query.s_password;
    let success = false;

    let conn = dbConnection();
    return new Promise(function (resolve, reject) {

        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
            let sql = `SELECT *
                   FROM user u
                   WHERE u.firstName LIKE '%${firstName}%'
                   AND u.lastName LIKE '%${lastName}%'
                   AND u.userName LIKE '%${userName}%';
                    `;

            conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                resolve(rows);
            });
        });//connect
    });//promise
}//getUser

app.get("/dbTest", function (req, res) {
    let conn = dbConnection();

    conn.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = `SELECT *
                    FROM user
                    `;

        conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            res.send(rows);
        });
    });
});//dbTest

function dbConnection() {
    let conn = mysql.createConnection({
        host: "mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
        user: "f64zakn2g1k9h5q6",
        password: "pilpwz1gmln8xckq",
        database: "rfgh18tfdnisudwj"
    });//createConnection
    return conn;
}

// starting server
app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("Express server is running...");
});