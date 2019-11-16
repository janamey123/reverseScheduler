const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js

// routes
app.get("/", function (req, res) {
    res.send("it works!");
});

app.get("/dbTest", function (req, res) {
    let conn = dbConnection();

    conn.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = "SELECT CURDATE()";

        conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            res.send(rows);
        });
    });
});//dbTest

function dbConnection() {
    let conn = mysql.createConnection({
        host: "cst336db.space",
        user: "cst336_dbUser",
        password: "xxxx",
        database: "cst336_db"
    });//createConnection
    return conn;
}

// starting server
app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("Express server is running...");
});