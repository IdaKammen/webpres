const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const pg = require('pg');
const dbURI = "postgres://nwzjyqympfxqpv:db64364662d38a5811c438757136f15e8039b264998dcf34d400f4711acad962@ec2-54-217-228-25.eu-west-1.compute.amazonaws.com:5432/dascnumjjf9evv" + "?ssl=true";
const connstring = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: connstring });

const app = express();
//--------MIDDLEWARE----------
app.use(express.static('public'));
app.use(bodyParser.json());

//function used for protecting endpoints ---------

// endpoint GET ----------------------------------

app.get('/', async function (req, res) {

    try {
        res.status(200).json(result.rows); //send response
    }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

// endpoint POST ---------------------------------

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
    //let hash = bcrypt.hashSync(updata.passwrd, 10);

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

    try {
    
    }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

//-------- Endpont DELETE ------------------------



// start server -----------------------------------

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server listening on port 3000!');
});
