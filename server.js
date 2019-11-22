const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const pg = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const authObj = require('./modules/auth')

const app = express();

let secretStash;
 try {
    secretStash = require("./modules/secrets");
 } catch (error) {
     console.log("not running localy so no secrets to share");
 };

const conString = process.env.DATABASE_URL || secretStash.dbURI;
const pool = new pg.Pool({ connectionString: conString });

//--------MIDDLEWARE----------

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use('/lists', authObj.userAuth);
app.use('/editor', authObj.userAuth);
app.use('/edititem', authObj.userAuth);
app.use('/profileinfo', authObj.userAuth);

// start server --------------------------------------------------------

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), () => console.log('server running on port', app.get('port')));


// -------- USER endpoints ----------------------------------------------

// --- endpoint for creating new list -----------------------------------

app.post('/lists', async function (req, res) {

    let updata = req.body;

    let sql = 'INSERT INTO lists (id, title, public, userid) VALUES(DEFAULT, $1, $2, $3) RETURNING *';
    let values = [updata.title, updata.public, updata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "insert OK" });
        }
        else {
            throw "Insert failed"
        }
    } catch (err) {
        res.status(500).json({ error: err });
    }
});


// --- endpoint for listing lists in user -------------------------------

app.get('/lists', async function (req, res) {

    let sql = 'SELECT * FROM lists WHERE userid = $1';
    let values = [authObj.auth.userid];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows);

    } catch (err) {
        res.status(500).json(err);
    }

});

// --- endpoint for deleting a list --------------------------------------

app.delete('/lists', async function (req, res) { 

    let updata = req.body;

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

app.put('/lists', async function (req, res) {

    let updata = req.body; 

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

    let updata = req.body;

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

    let listID = req.query.listid;

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

// --- PUT endpoint EDITOR --------------------------------------------------

app.put('/editor', async function (req, res) {

    let updata = req.body;

    let sql = 'UPDATE items SET done = $1 WHERE id = $2 RETURNING *';
    let values = [updata.done, updata.itemid];

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

    let updata = req.body;

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

    let updata = req.body;

    let hash = bcrypt.hashSync(updata.password, 10);

    let sql = 'INSERT INTO users (id, password, email, username) VALUES(DEFAULT, $1, $2, $3) RETURNING *';
    let values = [hash, updata.email, updata.username];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            let payload = { userid: result.rows[0].id };
            let tok = jwt.sign(payload, secretStash.secret, { expiresIn: "12h" });
            res.status(200).json({
                email: result.rows[0].email, 
                userid: result.rows[0].id, 
                username: result.rows[0].username, 
                token: tok });
        }
        else {
            throw "Failed to create user";
        }

    }
    catch (err) {
        res.status(500).json({ error: err, msg: "could not create new user" });
    }
});


// ---- HOME INDEX -  POST endpoint --------------------

app.post('/auth', async function (req, res) {

    let updata = req.body;

    let sql = 'SELECT * FROM users WHERE username = $1';
    let values = [updata.username];

    try {
        let result = await pool.query(sql, values)

        if (result.rows.length == 0) {
            res.status(404).json({ msg: "user do not exist" });
        }
        else {
            let check = bcrypt.compareSync(updata.password, result.rows[0].password);
            if (check == true) {
                let payload = { userid: result.rows[0].id };
                let tok = jwt.sign(payload, secretStash.secret, { expiresIn: "12h" });
                res.status(200).json({
                    email: result.rows[0].email,
                    userid: result.rows[0].id,
                    username: result.rows[0].username,
                    token: tok
                });
            } else {
                res.status(401).json({ msg: "wrong password" });
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

    let updata = req.body;

    let hash = bcrypt.hashSync(updata.password, 10);

    let sql = 'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING *';
    let values = [updata.username, updata.email, hash, authObj.auth.userid];

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
    let values = [authObj.auth.userid];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows);

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
