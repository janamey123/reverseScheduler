const express = require("express");
const mysql = require("mysql");
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(session({
    secret: "top secret!",
    resave: true,
    saveUninitialized: true
}));
app.use(express.urlencoded({extended: true}));

// routes

app.get("/", async function (req, res) {
    let groups = await getGroups();
    res.render("index", {"groups": groups});
});

app.post("/", async function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let hashedPwd = "";
    let userMatch = false;

    let result = await checkUsername(username);

    if (result.length > 0) {
        hashedPwd = result[0].password;
        if (result[0].username == username) {
            userMatch = true;
        }
    }
    let passwordMatch = await checkPassword(password, hashedPwd);

    if (userMatch && passwordMatch) {
        req.session.authenticated = true;
        req.session.username = username;
        res.send(true);
    } else {
        let groups = await getGroups();
        res.send(false);
    }
});

app.get("/dashboard", isAuthenticated, function (req, res) {
    res.render("dashboard");
});

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/");
});

app.get("/account", isAuthenticated, function (req, res) {
    res.render("account");
});

app.get("/addAppointment", isAuthenticated, function (req, res) {
    res.render("addAppointment");
});

app.get("/addAppointmentRequest", async function (req, res) {
    let scheduleId = await getScheduleId(req.session.username);
    let id = scheduleId[0].scheduleId;
    let success = false;

    if (id == 0) {
        res.send(success);
    } else {
        let insert = await insertAppointment(req.query, id);
        success = true;
        res.send(success);
    }
});

app.get("/deleteAppointment", isAuthenticated, function (req, res) {
    res.render("deleteAppointment");
});

app.get("/deleteAppointmentRequest", async function (req, res) {
    let scheduleId = await getScheduleId(req.session.username);
    let id = scheduleId[0].scheduleId;
    let success = false;

    if (id == undefined) {
        res.send(success);
    } else {
        let del = await deleteAppointment(req.query, id);
        if (del.affectedRows == 0) {
            res.send(success);
        } else {
            success = true;
            res.send(success);
        }
    }
});

app.get("/getUsersEvents", async function (req, res) {
    let username = req.session.username;
    let scheduleId = await getScheduleId(username);
    let id = scheduleId[0].scheduleId;

    let events = await getEvents(id);
    res.send(events);
});

app.get("/groups", isAuthenticated, function (req, res) {
    res.render("groups");
});

app.get("/signUp", function (req, res) {
    res.render("signUp");
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
        if (insert.affectedRows == 0) {
            res.send(success);
        } else {
            let schedule = await createNewSchedule(req.query);
            success = true;
            res.send(success);
        }
    }
});

app.get("/userSearchSection", async function (req, res) {
    let searchResult = await getSearchResult(req.query);
    res.send(searchResult);
});


// functions

function getUser(query) {
    // connect to database here to check if user already exists
    let username = query.username;

    let conn = dbConnection();
    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected! Get user");

            let params = [username];

            let sql = `SELECT *
                       FROM user u
                       WHERE u.username = ?;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                resolve(rows);
            });
        });//connect
    });//promise
}//getUser

function insertNewUser(query) {
    let username = query.username;
    let firstName = query.firstName;
    let lastName = query.lastName;
    let password = query.s_password;
    var hash = bcrypt.hashSync(password, saltRounds);

    let conn = dbConnection();
    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected! Insert user");

            let params = [firstName, lastName, username, hash];
            let sql = 'INSERT INTO user (firstName, lastName, username, password) VALUES (?, ?, ?, ?);';

            conn.query(sql, params, function (err, result) {
                if (err) throw err;
                resolve(result);
            });
        });//connect
    });//promise
}//insertNewUser

async function createNewSchedule(query) {
    let user = await getUser(query);
    let userId = user[0].userId;

    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = 'INSERT INTO schedule (userId) VALUES (?);';

            conn.query(sql, [userId], function (err, result) {
                if (err) throw err;
                resolve(result);
            });
        });//connect
    });//promise
}//createNewSchedule

function insertAppointment(body, scheduleId) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(async function (err) {
            if (err) throw err;
            console.log("Connected! Insert appointment");

            let sql = `INSERT INTO appointment
                       (scheduleId, description, date, startTime, endTime)
                       VALUES (?,?,?,?,?)
                       `;

            let params = [scheduleId, body.description, body.date, body.startTime, body.endTime];

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//insertAppointment

function deleteAppointment(body, scheduleId) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(async function (err) {
            if (err) throw err;
            console.log("Connected! Delete appointment");

            let startTime = body.startTime + ":00";
            let endTime = body.endTime + ":00";

            let params = [scheduleId, body.description, body.date, startTime, endTime];

            let sql = `DELETE
                       FROM appointment
                       WHERE scheduleId = ?
                       AND description = ? 
                       AND date = ?
                       AND startTime = ?
                       AND endTime = ?;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//insertAppointment

function getScheduleId(username) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [username];
            let sql = `SELECT s.scheduleId
                       FROM user u JOIN schedule s ON u.userId = s.scheduleId
                       WHERE u.username = ?;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getScheduleId

function getGroups() {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT groupName 
                       FROM rfgh18tfdnisudwj.group;
                       `;

            conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getGroups

function getSearchResult(query) {
    let searchName = query.searchName;
    let searchUsername = query.searchUsername;
    let searchGroup = query.searchGroup;
    let sortBy = query.sortBy;

    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [];
            let sql = `SELECT u.firstName, u. username, g.groupName
                       FROM user u, groupmember m, rfgh18tfdnisudwj.group g
                       WHERE u.userId = m.userId
                       AND m.groupId = g.groupId
                       `;

            if (searchName) {
                sql += " AND u.firstName = ?";
                params.push(searchName);
            }
            if (searchUsername) {
                sql += " AND u.username = ?";
                params.push(searchUsername);
            }
            if (searchGroup && searchGroup != "Select one") {
                sql += " AND g.groupName = ?";
                params.push(searchGroup);
            }
            if (sortBy) {
                sql += " ORDER BY " + sortBy;
            }

            sql += ";";

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getSearchResult

function checkPassword(password, hashedValue) {
    return new Promise(function (resolve, reject) {
        bcrypt.compare(password, hashedValue, function (err, result) {
            resolve(result);
        });//compare
    });//promise
}//checkPassword

/**
 * Checks whether the username exists in database.
 * if found, returns corresponding record.
 * @param {string} username
 * @return {array of objects}
 */
function checkUsername(username) {
    let sql = "SELECT * FROM user WHERE username = ?";
    return new Promise(function (resolve, reject) {
        let conn = dbConnection();
        conn.connect(function (err) {
            if (err) throw err;
            conn.query(sql, [username], function (err, rows, fields) {
                if (err) throw err;
                resolve(rows);
            });//query
        });//connect
    });//promise
}//checkUsername

function isAuthenticated(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect("/");
    } else {
        next();
    }
}//isAuthenticated

function getEvents(scheduleId){
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT *
                       FROM appointment a
                       WHERE a.scheduleId = ?;
                       `;

            conn.query(sql, [scheduleId], function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise


}//getEvents

function dbConnection() {
    let conn = mysql.createConnection({
        host: "mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
        user: "f64zakn2g1k9h5q6",
        password: "pilpwz1gmln8xckq",
        database: "rfgh18tfdnisudwj"
    });//createConnection
    return conn;
}//dbConnection

// starting server
app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("Express server is running...");
});