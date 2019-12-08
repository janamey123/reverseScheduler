const express = require("express");
const mysql = require("mysql");
const app = express();
const session = require("express-session");
const path = require("path");
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/', loginRouter );

// routes
app.get("/", async function (req, res) {
    let groups = await getGroups();
    res.render("index", {title: 'login', "groups": groups});
});
app.post("/", function (req, res) {
    // TODO: do something to login

    //Return success or failure
    res.json({});
});
app.get("/dashboard", function (req, res) {
    res.render("dashboard", {
        title: 'Logged in Dashboard'
    });
});

app.get("/account", function (req, res) {
    res.render("account");
});

app.get("/addAppointment", function (req, res) {
    res.render("addAppointment");
});

app.get("/addAppointmentRequest", async function (req, res) {
    let scheduleId = await getScheduleId(req.query.username);
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

app.get("/deleteAppointment", function (req, res) {
    res.render("deleteAppointment");
});

app.get("/deleteAppointmentRequest", async function (req, res) {
    let scheduleId = await getScheduleId(req.query.username);
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

app.get("/groups", function (req, res) {
    res.render("groups");
});

app.get("/signUp", function (req, res) {
    res.render("signUp");
});

app.post("/loginRequest", function (req, res, next) {
    //let user = await getUser(req.query);
    //let success = false;
    console.log('loginRequest');
    
    
    //TODO: Do something to log in...
    let successful = false;
    
    if(req.body.username === 'admin' && req.body.password === 'admin') {
        successful = true;
        //req.session.username = req.body.username;
    } else {
        //delete req.session.username;
    }
   
    //console.log("req.body: ", req.body);
   
    //Return success or failure
    res.send(successful);
    
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

    let conn = dbConnection();
    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected! Insert user");

            let params = [firstName, lastName, username, password];
            let sql = 'INSERT INTO user (firstName, lastName, username, password) VALUES (?, ?, ?, ?);';

            conn.query(sql, params, function (err, result) {
                if (err) throw err;
                resolve(result);
            });
        });//connect
    });//promise

}//insertNewUser

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