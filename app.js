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

//********//
// routes //
//********//

//****************//
// sign up/ login //
//****************//
app.get("/", async function (req, res) {
    let groups = await getGroups();
    res.render("index", {"groups": groups});
});//index

app.get("/signUp", function (req, res) {
    res.render("signUp");
});//signUp

app.get("/signingUpRequest", async function (req, res) {
    let user = await getUser(req.query.username);
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
});//signingUpRequest

app.get("/userSearchSection", async function (req, res) {
    let searchResult = await getSearchResult(req.query);
    res.send(searchResult);
});//userSearchSection

app.post("/", async function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let hashedPwd = "";
    let userMatch = false;

    let result = await getUser(username);


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
});//index

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/");
});//logout

//**************//
// appointments //
//**************//

app.get("/dashboard", isAuthenticated, function (req, res) {
    res.render("dashboard");
});//dashboard

app.get("/addAppointment", isAuthenticated, function (req, res) {
    res.render("addAppointment");
});//appAppontment

app.get("/addAppointmentRequest", isAuthenticated, async function (req, res) {
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
});//addAppointmentRequest

app.get("/deleteAppointment", isAuthenticated, function (req, res) {
    res.render("deleteAppointment");
});//deleteAppointment

app.get("/deleteAppointmentRequest", isAuthenticated, async function (req, res) {
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
});//deleteAppointmentRequest

app.get("/editAppointment", isAuthenticated, function (req, res) {
    res.render("editAppointment");
});//editAppointment

app.get("/getAppointmentRequest", async function (req, res) {
    let scheduleId = await getScheduleId(req.session.username);
    let id = scheduleId[0].scheduleId;

    if (id == undefined) {
        res.send(false);
    } else {
        try {
            let appointment = await getAppointment(req.query, id);
            res.send(appointment);
        } catch (e) {
            res.send(false);
        }

    }
});//getAppointmentRequest

app.get("/changeAppointmentRequest", async function (req, res) {
    let scheduleId = await getScheduleId(req.session.username);
    let id = scheduleId[0].scheduleId;

    if (id == undefined || req.query.appointmentId == 0) {
        res.send(false);
    } else {
        try {
            let appointment = await changeAppointment(req.query, id);
            res.send(true);
        } catch (e) {
            res.send(false);
        }
    }
});//changeAppointmentRequest

app.get("/getUsersEvents", async function (req, res) {
    let username = req.session.username;
    let scheduleId = await getScheduleId(username);
    let id = scheduleId[0].scheduleId;

    let events = await getEvents(id);
    res.send(events);
});//getUsersEvents

//********//
// groups //
//********//

app.get("/groups", isAuthenticated, async function (req, res) {
    let groups = await getGroups();
    res.render("groups", {"groups": groups});
});//groups

app.get("/getUsersGroups", async function (req, res) {
    let username = req.session.username;
    let groups = await getUsersGroups(username);

    res.send(groups);
});//getUsersGroups

app.get("/addGroup", isAuthenticated, function (req, res) {
    res.render("addGroup");
});//addGroup

app.get("/addGroupRequest", async function (req, res) {
    let group = await getSingleGroup(req.query);
    let success = false;
    try {
        if (group[0].groupname == req.query.groupName) {
            res.send(success);
        }
    } catch (e) {
        let insert = await insertNewGroup(req.query);
        if (insert.affectedRows == 0) {
            res.send(success);
        } else {
            let user = await getUser(req.session.username);
            let group = await getSingleGroup(req.query);

            let addUser = await addGroupMember(group[0].groupId, user[0].userId);
            if (addUser.affectedRows == 0) {
                res.send(success);
            }
            success = true;
            res.send(success);
        }
    }
});//addGroupRequest

app.get("/addMemberToGroup", isAuthenticated, async function (req, res) {
    let groups = await getGroups();
    res.render("addMemberToGroup", {"groups": groups});
});//addMemberToGroup

app.get("/addNewMemberRequest", async function (req, res) {
    let user = await getUser(req.query.member);
    let group = await getSingleGroup(req.query);
    let success = false;
    let userId = 0;

    try {
        userId = user[0].userId;
    } catch (e) {
        res.send(success);
        return;
    }
    try {
        let addUser = await addGroupMember(group[0].groupId, userId);
        if (addUser.affectedRows == 0) {
            res.send(success);
        } else {
            success = true;
            res.send(success);
        }
    } catch (e) {
        res.send(success);
    }

});//addNewMemberRequest

app.get("/deleteGroup", isAuthenticated, async function (req, res) {
    let groups = await getGroups();
    res.render("deleteGroup", {"groups": groups});
});//deleteGroup

app.get("/deleteGroupRequest", async function (req, res) {
    let group = await getSingleGroup(req.query);
    let success = false;
    try {

        let delGroup = await deleteGroup(group[0].groupId);
        let delMemberConn = await deleteGroupMemberConnection(group[0].groupId);

        if (delGroup.affectedRows == 0) {
            res.send(success);
        } else {
            success = true;
            res.send(success);
        }
    } catch (e) {
        res.send(success);
    }
});//deleteGroupRequest

app.get("/getAvailability", async function (req, res) {
    let available = await getAvailabilityOfGroup(req.query);
    res.send(available);
});//getAvailability

//*********//
// account //
//*********//

app.get("/account", isAuthenticated, function (req, res) {
    res.render("account");
});//account

app.get("/getUserInfo", async function (req, res) {
    let user = await getUser(req.session.username);
    res.send(user);
});//getUserInfo

app.get("/updateAccount", async function (req, res) {
    res.render("updateAccount");
});//updateAccount

app.get("/upUser", async function (req, res) {
    try {
        let user = await updateUser(req.query, req.session.username);
        req.session.username = req.query.username;
        res.send(true);
    } catch (e) {
        res.send(false);
    }
});//upUser

app.get("/deleteAccount", async function (req, res) {
    res.render("deleteAccount");
});//deleteAccount

app.get("/deleteUser", async function (req, res) {
    try {
        let userId = await getUser(req.session.username);
        let scheduleId = await getScheduleId(req.session.username);
        let user = await deleteUser(req.session.username);
        let schedule = await deleteS(userId[0].userId);
        let groupmember = await deleteG(userId[0].userId);
        let appointment = await deleteA(scheduleId[0].scheduleId);
        res.send(true);
    } catch (e) {
        res.send(false);
    }
});//deleteAccount

app.get("/totalAmountHoursUser", async function (req, res) {
        let number = await getTotalAmountHoursUser();
        res.send(number);
});//totalAmountHoursUser

app.get("/sumAppointments", async function (req, res) {
    let number = await getSumAppointmentPerUser();
    res.send(number);
});//totalAmount

app.get("/avgAmountHours", async function (req, res) {
    let number = await getAvgAmountHours();
    res.send(number);
});//avgAmountHours

app.get("/totalAmountGroups", async function (req, res) {
    let number = await getTotalAmountGroups();
    res.send(number);
});//totalAmountGroups

app.get("/userPerGroup", async function (req, res) {
    let number = await getUserPerGroup();
    res.send(number);
});//userPerGroup

app.get("/totalAmountUser", async function (req, res) {
    let number = await getTotalAmountUser();
    res.send(number);
});//totalAmountUser


//***********//
// functions //
//***********//

//******//
// user //
//******//

function getUser(username) {
    // connect to database here to check if user already exists
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [username];

            let sql = `SELECT *
                       FROM \`user\` u
                       WHERE u.username = ?;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
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

            let params = [firstName, lastName, username, hash];
            let sql = 'INSERT INTO \`user\` (firstName, lastName, username, password) VALUES (?, ?, ?, ?);';

            conn.query(sql, params, function (err, result) {
                if (err) throw err;
                conn.end();
                resolve(result);
            });
        });//connect
    });//promise
}//insertNewUser

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
                       FROM \`user\` u 
                       JOIN \`groupmember\` m ON u.userId = m.userId 
                       JOIN \`group\` g ON m.groupId = g.groupId
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

function isAuthenticated(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect("/");
    } else {
        next();
    }
}//isAuthenticated

//**************//
// appointments //
//*************//

async function createNewSchedule(query) {
    let user = await getUser(query.username);
    let userId = user[0].userId;

    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = 'INSERT INTO \`schedule\` (userId) VALUES (?);';

            conn.query(sql, [userId], function (err, result) {
                if (err) throw err;
                conn.end();
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

            let sql = `INSERT INTO \`appointment\`
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
}//deleteAppointment

function getEvents(scheduleId) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT *
                       FROM \`appointment\` a
                       WHERE a.scheduleId = ?
                       ORDER BY a.date, a.startTime;
                       `;

            conn.query(sql, [scheduleId], function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getEvents

function getAppointment(query, id) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let startTime = query.startTime + ":00";
            let endTime = query.endTime + ":00";
            let params = [id, query.description, query.date, startTime, endTime];

            let sql = `SELECT *
                       FROM \`appointment\` a
                       WHERE a.scheduleId = ? 
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
}//getAppointment

function changeAppointment(query, id) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let startTime = query.startTime + ":00";
            let endTime = query.endTime + ":00";
            let params = [query.description, query.date, startTime, endTime, id, query.appointmentId];

            let sql = `UPDATE \`appointment\` a 
                       SET a.description = ?, a.date = ?, a.startTime = ?, a.endTime =  ? 
                       WHERE a.scheduleId = ? 
                       AND a.appointmentId = ?;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//changeAppointment

function getScheduleId(username) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [username];
            let sql = `SELECT s.scheduleId
                       FROM \`user\` u JOIN \`schedule\` s ON u.userId = s.scheduleId
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

//********//
// groups //
//********//

function getGroups() {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT groupName, groupId 
                       FROM \`group\`;
                       `;

            conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getGroups

function getUsersGroups(username) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT g.groupname, u.username
                       FROM \`user\` u 
                       JOIN \`groupmember\` m ON u.userId = m.userId 
                       RIGHT JOIN \`group\` g ON m.groupId = g.groupId
                       ORDER BY g.groupname, u.username;;
                       `;

            conn.query(sql, [username], function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getUsersGroups

function getSingleGroup(query) {
    // connect to database here to check if group name already exists
    let groupname = query.groupName;

    let conn = dbConnection();
    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [groupname];

            let sql = `SELECT *
                       FROM \`group\` g
                       WHERE g.groupname = ?;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getSingleGroup

function deleteGroup(groupId) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(async function (err) {
            if (err) throw err;

            let sql = `DELETE FROM \`group\` 
                       WHERE groupId = ?;
                       `;

            conn.query(sql, [groupId], function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//deleteGroup

function deleteGroupMemberConnection(groupId) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(async function (err) {
            if (err) throw err;

            let sql = `DELETE FROM \`groupmember\` 
                       WHERE groupId = ?;
                       `;

            conn.query(sql, [groupId], function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//deleteGroupMemberConnection

function addGroupMember(groupId, userId) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(async function (err) {
            if (err) throw err;

            let sql = `INSERT INTO \`groupmember\`
                       (groupId, userId)
                       VALUES (?, ?)
                       `;

            let params = [groupId, userId];

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//addGroupMember

function insertNewGroup(query) {
    let groupname = query.groupName;

    let conn = dbConnection();
    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [groupname];
            let sql = 'INSERT INTO \`group\` (groupname) VALUES (?);';

            conn.query(sql, params, function (err, result) {
                if (err) throw err;
                conn.end();
                resolve(result);
            });
        });//connect
    });//promise
}//insertNewGroup

function getAvailabilityOfGroup(query) {
    let groupname = query.groupName;

    let conn = dbConnection();
    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [groupname];
            let sql = `SELECT u.username, a.description, a.date, a.startTime, a.endTime
                       FROM \`appointment\` a 
                       JOIN \`schedule\` s ON a.scheduleId = s.scheduleId
                       JOIN \`user\` u ON s.userId = u.userId
                       WHERE u.userId IN (  
                                          SELECT m.userId
                                          FROM \`groupmember\` m 
                                          JOIN \`group\` g ON m.groupId = g.groupId
                                          WHERE g.groupName = ?)
                       ORDER BY a.date, a.startTime;
                       `;

            conn.query(sql, params, function (err, result) {
                if (err) throw err;
                conn.end();
                resolve(result);
            });
        });//connect
    });//promise
}//getAvailabilityOfGroup

//*********//
// account //
//*********//

function updateUser(query, user) {

    let password = query.old;
    var hash = bcrypt.hashSync(password, saltRounds);
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [query.firstname, query.lastname, query.username, hash, user];

            let sql = `UPDATE \`user\` u
                       SET u.firstName = ?, u.lastName = ?, u.username = ?, u.password =  ? 
                       WHERE u.username = ? 
                       ;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//updateUser


function deleteUser(user) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [user];

            let sql = `DELETE
                       FROM \`user\` 
                       WHERE username = ? 
                       ;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//deleteUser


function deleteS(userId) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [userId];

            let sql = `DELETE
                       FROM \`schedule\` 
                       WHERE userId = ? 
                       ;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//deleteSchedule

function deleteG(userId) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [userId];

            let sql = `DELETE
                       FROM \`groupmember\` 
                       WHERE userId = ? 
                       ;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//deleteGroupmember

function deleteA(scheduleId) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let params = [scheduleId];

            let sql = `DELETE
                       FROM \`appointment\` 
                       WHERE scheduleId = ? 
                       ;
                       `;

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//deleteAppointments

function getTotalAmountHoursUser() {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT u.username, sum((a.endTime - a.startTime)) as 'time'
                       FROM \`appointment\` a 
                       JOIN \`schedule\` s ON a.scheduleId = s.scheduleId 
                       JOIN \`user\` u ON s.userId = u.userId
                       GROUP BY u.username
                       ORDER BY time, u.username;
                       `;

            conn.query(sql, function (err, result) {
                if (err) throw err;
                conn.end();
                resolve(result);
            });
        });//connect
    });//promise
}//getTotalAmountHoursUser

function getSumAppointmentPerUser() {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT u.username, count(a.appointmentId) as 'count'
                       FROM \`appointment\` a 
                       RIGHT OUTER JOIN \`schedule\` r ON a.scheduleId = r.scheduleId 
                       LEFT OUTER JOIN \`schedule\` l ON a.scheduleId = l.scheduleId 
                       JOIN \`user\` u ON l.userId = u.userId
                       GROUP BY a.scheduleId
                       ORDER BY count, u.username;
                       `;

            conn.query(sql, function (err, result) {
                if (err) throw err;
                conn.end();
                resolve(result);
            });
        });//connect
    });//promise
}//getSumAppointmentPerUser

function getAvgAmountHours() {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT avg(t.time) as 'avg'
                       FROM (
                            SELECT u.username, a.startTime, a.endTime, sum((a.endTime - a.startTime)) as 'time'
                            FROM \`appointment\` a 
                            JOIN \`schedule\` s ON a.scheduleId = s.scheduleId 
                            JOIN \`user\` u ON s.userId = u.userId
                            GROUP BY u.username) t;
                       `;

            conn.query(sql, function (err, result) {
                if (err) throw err;
                conn.end();
                resolve(result);
            });
        });//connect
    });//promise
}//getAvgAmountHours

function getTotalAmountGroups() {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT count(g.groupName) as 'count'
                       FROM \`group\` g;
                       `;

            conn.query(sql, function (err, result) {
                if (err) throw err;
                conn.end();
                resolve(result);
            });
        });//connect
    });//promise
}//getTotalAmountGroups

function getUserPerGroup() {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT g.groupName, count(m.userId) as 'count'
                       FROM \`group\` g 
                       Right OUTER JOIN \`groupmember\` m ON g.groupId = m.groupId
                       GROUP BY g.groupName
                       ORDER BY count, g.groupName;
                       `;

            conn.query(sql, function (err, result) {
                if (err) throw err;
                conn.end();
                resolve(result);
            });
        });//connect
    });//promise
}//getUserPerGroup

function getTotalAmountUser() {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;

            let sql = `SELECT count(u.username) as 'count'
                       FROM \`user\` u;
                       `;

            conn.query(sql, function (err, result) {
                if (err) throw err;
                conn.end();
                resolve(result);
            });
        });//connect
    });//promise
}//getTotalAmountUser


//Building connection to database
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