const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');


const pg = require('pg');
const dbURI = "postgres://nwzjyqympfxqpv:db64364662d38a5811c438757136f15e8039b264998dcf34d400f4711acad962@ec2-54-217-228-25.eu-west-1.compute.amazonaws.com:5432/dascnumjjf9evv" + "?ssl=true";
const dbConnection = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: dbConnection });

const jwt = require('jsonwebtoken')
const secret = "frenchfriestastegood!";

const app = express();

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



// start server -----------------------------------

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server listening on port 3000!');
});
