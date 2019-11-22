const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const pg = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors'); //only necessary when you are not running clients on the server

const app = express();


const dbURI = "postgres://nwzjyqympfxqpv:db64364662d38a5811c438757136f15e8039b264998dcf34d400f4711acad962@ec2-54-217-228-25.eu-west-1.compute.amazonaws.com:5432/dascnumjjf9evv" + "?ssl=true";
const conString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: conString });

const secret = "glederMegtilJul!"; //for tokens - should be stored as an environment variable

let auth;

//--------MIDDLEWARE----------

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use('/user', userAuth);
app.use('/editor', userAuth);
app.use('/profileinfo', userAuth);

//function used for protecting endpoints ---------
function userAuth(req, res, next) {


    let token = req.headers['authorization'];

    if (token) {
        try {
            auth = jwt.verify(token, secret);
            next();
        } catch (err) {
            res.status(403).json({ msg: "Not a valid token" });
        }
    }
    else {
        res.status(403).json({ msg: "No token" });
    }
}

// start server -----------------------------------

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), () => console.log('server running on port', app.get('port')));


// -------- USER endpoints ----------------------------------------------

// --- endpoint for creating new list -----------------------------------

app.post('/user', async function (req, res) {

    let updata = req.body;

    let sql = 'INSERT INTO lists (id, title, public, userid) VALUES(DEFAULT, $1, $2, $3) RETURNING *';
    let values = [updata.title, updata.public, updata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "insert OK" }); //send response
        }
        else {
            throw "Insert failed"
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err });
    }
});


// --- endpoint for listing lists in user -------------------------------

app.get('/user', async function (req, res) {

    let sql = 'SELECT * FROM lists WHERE userid = $1';
    let values = [auth.userid];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows);

    } catch (err) {
        res.status(500).json(err);
    }

});

// --- endpoint for deleting a list --------------------------------------

app.delete('/user', async function (req, res) { // delete list / delete travel

    let updata = req.body; // dataen som sendes fra client-siden

    let sql = 'DELETE FROM lists WHERE id = $1 RETURNING *';
    let values = [updata.listID];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Delete OK" });
        }
        else {
            throw "Delete failed";
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});

// --- PUT endpoint USER --------------------------------------------------

app.put('/user', async function (req, res) {

    let updata = req.body; // data som er sendt fra editor siden / clienten

    console.log(updata.public);

    let sql = 'UPDATE lists SET public = $1 WHERE id = $2 RETURNING *';
    let values = [updata.public, updata.listid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        }
        else {
            throw "insert failed";
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});


// -------- EDITOR endpoints ----------------------------------------------

// --- POST endpoint for creating new list item ------

app.post('/editor', async function (req, res) {

    let updata = req.body; // data som er sendt fra editor siden / clienten

    let sql = 'INSERT INTO items (id, item, description, listid, done, date) VALUES(DEFAULT, $1, $2, $3, $4, $5) RETURNING *';
    let values = [updata.item, updata.description, updata.listid, updata.done, updata.duedate];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "insert OK" });
        }
        else {
            throw "insert failed";
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
        console.log(err);
    }
});

// --- editor PUT --- new title -----------------------------

app.put('/editor/title', async function (req, res) {

    let updata = req.body; // data som er sendt fra editor siden / clienten

    let sql = 'UPDATE lists SET title = $1 WHERE id = $2 RETURNING *';
    let values = [updata.title, updata.listid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        }
        else {
            throw "insert failed";
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});

// --- GET endpoint for showing list ---------------------------------

app.get('/editor', async function (req, res) {

    let listID = req.query.listid; // the data sent from the client

    let sql = 'SELECT * FROM items WHERE listid = $1';
    let values = [listID];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});

// --- DELETE endpoint for deleteing list item ----------------------

app.delete('/editor', async function (req, res) {

    let updata = req.body; //the data sent from the client

    let sql = 'DELETE FROM items WHERE id = $1 RETURNING *';
    let values = [updata.itemID];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Delete OK" }); //send response
        }
        else {
            throw "Delete failed";
        }
    }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
    }
});

// ---- ENDPOINTS FOR EDIT ITEM ------------------
// ---- GET - item descriptions ------------------

app.get('/edititem', async function (req, res) {

    let itemID = req.query.itemid;

    let sql = "SELECT item, description, date FROM items WHERE id = $1";
    let values = [itemID];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows);

    } catch (err) {
        res.status(500).json(err);

    }

});


// ---- PUT - update descriptions -----------------

app.put('/edititem', async function (req, res) {

    let updata = req.body; //the data sent from the client


    let sql = 'UPDATE items SET item = $1, description = $2, date = $3 WHERE id = $4 RETURNING *';
    let values = [updata.item, updata.description, updata.duedate, updata.listid];

    try {
        let result = await pool.query(sql, values);


        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Insert OK", item: result.rows[0].item, description: result.rows[0].description, date: result.rows[0].date }); //send response

        }
        else {
            throw "Insert failed";
        }

    } catch (err) {
        res.status(500).json({ error: err });
    }
});


// ---- ENDPOINTS for createuser ---------------
// ---- POST -----------------------------------

app.post('/createuser', async function (req, res) {

    let updata = req.body; //the data sent from the client

    let hash = bcrypt.hashSync(updata.password, 10);

    let sql = 'INSERT INTO users (id, username, password, email ) VALUES(DEFAULT, $1, $2, $3) RETURNING *';
    let values = [updata.username, hash, updata.email];

    try {
        let result = await pool.query(sql, values);
        let idUser = result.row[0].id;

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Insert OK", body: updata, result: result, userid: idUser });
        }
        else {
            throw "Insert failed";
        }

    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});



// ---- HOME INDEX -  POST endpoint --------------------

app.post('/', async function (req, res) {

    let updata = req.body;

    let sql = 'SELECT * FROM users WHERE username = $1';                              // hent alt hvor brukernavnet er updata.username.
    let values = [updata.username];

    try {
        let result = await pool.query(sql, values)

        if (result.rows.length == 0) {                                                   // om ingen bruker er registrert med dette brukernavnet vil result være null
            res.status(400).json({ msg: "User doesn´t exist" });
        }
        else {                                                                              // hvis det eksisterer så sjekk passordet: 
            let check = bcrypt.compareSync(updata.password, result.rows[0].password);       //Hvilken possisjon er passordet å i resultatet??
            if (check == true) {                                                            // hvis det er samme passord som på DB
                let payload = { userid: result.rows[0].id };                                //lag en payload som du må ha med til brukersiden
                let tok = jwt.sign(payload, secret, { expiresIn: "12h" });                  // lag en token som gjør at brukeren forblir pålogget
                res.status(200).json({ email: result.rows[0].email, userid: result.rows[0].id, username: result.rows[0].username, token: tok }); // send alt til clienten
            } else {
                res.status(400).json({ msg: "wrong password" });                            // SPØRSMÅL!! hvorfor lage payload? hvor blir payload overført til client? id og email overfører vi jo i res ???
            }
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});

//--- USERPROFILE endpoints ----------------------------------------------
// --- PUT ---------------------------------------------------

app.put('/profileinfo', async function (req, res) {

    let updata = req.body; //the data sent from the client

    let hash = bcrypt.hashSync(updata.password, 10);

    let sql = 'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING *';
    let values = [updata.username, updata.email, hash, auth.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Insert OK", username: result.rows[0].username, email: result.rows[0].email, userid: result.rows[0].id }); //send response
        }
        else {
            throw "Insert failed";
        }

    } catch (err) {
        res.status(500).json({ error: err });
    }
});


// --- get ---------------------------

app.get('/profileinfo', async function (req, res) {

    let sql = "SELECT username, email FROM users WHERE id = $1";
    let values = [auth.userid];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows);

        console.log(result.rows);

    } catch (err) {
        res.status(500).json(err);

    }

});


// --- PUBLIC site endpoints -----------------------

app.get('/public', async function (req, res) {

    value = "true";

    let sql = 'SELECT * FROM lists WHERE public = $1';
    let values = [value];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows);

    } catch (err) {
        res.status(500).json(err);
    }

});

