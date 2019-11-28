const express = require("express");
const mysql = require("mysql");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
//app.use('/', loginRouter );

// routes
app.get("/", function (req, res) {
    res.render("index");
});
app.get("/account", function (req, res) {
    res.render("account");
});
app.get("/appointment", function (req, res) {
    res.render("appointment");
});
app.get("/groups", function (req, res) {
    res.render("groups");
});
app.post("/", function (req, res) {
    // TODO: do something to login

    //Return success or failure
    res.json({

    });
});
app.get("/signUp", function (req, res) {
    res.render("signUp");
});
app.get("/dashboard", function (req, res) {
    res.render("dashboard", {
        title: 'Logged in Dashboard'
    });
});

app.get("/loginRequest", async function (req, res) {
    let user = await getUser(req.query);
    let success = false;
    console.log('loginRequest');
    res.send(true);
});

app.get("/signingUpRequest", async function (req, res) {
    let user = await getUser(req.query);
    let success = false;
    try {
        if (user[0].username == req.query.username) {
            res.send(success);
        }
    } catch (e) {
        let insert = await insertNewUser(req.query);
        success = true;
        res.send(success);
    }
});

// functions
function getUser(query) {
    // connect to database here to check if user already exists
    let username = query.username;

    let conn = dbConnection();
    return new Promise(function (resolve, reject) {

        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
            let sql = `SELECT *
                   FROM user u
                   WHERE u.username LIKE '${username}';
                    `;

            conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                resolve(rows);
            });
        });//connect
    });//promise
}//getUser

function insertNewUser(query) {
    // connect to database here to check if user already exists
    let username = query.username;
    let firstName = query.firstName;
    let lastName = query.lastName;
    let password = query.s_password;

    let conn = dbConnection();
    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
            let sql = 'INSERT INTO user (firstName, lastName, username, password) VALUES (?, ?, ?, ?);';

            conn.query(sql, [firstName, lastName, username, password], function (err, result) {
                console.log("In conn.query!");
                console.log(result);
                if (err) throw err;
                console.log("1 record inserted");
                resolve(result);
            });
        });//connect
    });//promise

}//insertNewUser

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