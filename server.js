const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();

let secrets;
 try {
     secrets = require("./secrets")
 } catch (error) {
     console.log("not running localy so no secrets to share");
 };

const pg = require('pg');
const dbConnection = process.env.DATABASE_URL || secrets.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: dbConnection });

const secret = "frenchfriestastegood!";
const jwt = require('jsonwebtoken')

// start server -----------------------------------

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function () {console.log('server running on port', app.get('port'));});

//--------MIDDLEWARE----------

app.use(express.static('public'));
app.use(bodyParser.json());

// ROUTING --------------------------



// --- GET ----------------------------------

app.get('/', async function (req, res) {

    try {
        res.status(200).json(result.rows); //send response
    }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

// --- POST ---------------------------------

app.post('/', async function (req, res) {
    try {

    }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

// ---- endpoint - users POST--------------------

app.post('/user', async function (req, res) {

    let updata = req.body; //the data sent from the client

    //hashing the password before it is stored in the DB
    let hash = bcrypt.hashSync(updata.passwrd, 10);

    let sql = 'INSERT INTO users (id, username, password, email ) VALUES(DEFAULT, $1, $2, $3) RETURNING *';
    let values = [updata.username, updata.password, updata.email];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Insert OK" }); //send response
        }
        else {
            throw "Insert failed";
        }

    }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

// ---- endpoint - auth (login) POST--------------------

app.post('/auth', async function (req, res) {

    let updata = req.body;
    let sql = 'SELECT * FROM users where email = 1$';
    let values = [updata.email];

    try {
        let result = await pool.query(sql, values)

        if (result.rows.length == 0) {
            res.status(400).json({ msg: "User doesn´t exist" });
        }
        else {
            let check = bcrypt.compareSync(updata.passwrd, result.rows[0].pswhash);
            if (check == true) {
                let payload = { userid: result.rows[0].id };
                let tok = jwt.sign(payload, secret, { expiresIn: "12h" });
                res.status(200).json({ email: result.rows[0].email, userid: result.rows[0].id, token: tok });
            } else {
                res.status(400).json({ msg: "wrong password" });
            }
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});

//-------- Endpont DELETE ------------------------


