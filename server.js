const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const pg = require('pg');
const jwt = require('jsonwebtoken');

const app = express();


const dbURI = "postgres://nwzjyqympfxqpv:db64364662d38a5811c438757136f15e8039b264998dcf34d400f4711acad962@ec2-54-217-228-25.eu-west-1.compute.amazonaws.com:5432/dascnumjjf9evv" + "?ssl=true";
const conString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: conString });

const secret = "glederMegtilJul!";


//--------MIDDLEWARE----------

app.use(express.static('public'));
app.use(bodyParser.json());


// -------- USER endpoints ----------------------------------------------

// --- endpoint for listing lists in user -------------------------------

app.get('/user', async function (req, res) {

    let sql = "SELECT * FROM lists";
    try {
        let result = await pool.query(sql);
        res.status(200).json(result.rows); //send response in json

    } catch (err) {
        res.status(500).json(err); //send err in json

    }

});

// --- endpoint for deleting a list --------------------------------------

app.delete('/user', async function (req, res) {

    let updata = req.body; // dataen som sendes fra client-siden

    let sql = 'DELETE FROM lists WHERE id = $1 RETURNING *';
    let values = [updata.listID];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Delete OK" }); // send respons
        } else {
            throw "Delete failed";
        }
    } catch (err) {
        res.status(500).json({ error: err }); // send error respons. 
    }
});

// -------- EDITOR endpoints ----------------------------------------------

// --- POST endpoint for creating new list ------

app.post('/editor', async function (req, res) {

    let upData = req.body; // data som er sendt fra editor siden / clienten
    let sql = 'INSERT INTO lists (id, title, list, userid) VALUES(DEFAULT, $1, $2, $3) RETURNING *';
    let values = [upData.title, upData.list];

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

        console.log(err)
        res.status(500).json({ error: err });
    }
});

// --- GET endpoint for showing list ---------------------------------
// må kun få tak i lister som tilhører den aktuelle brukeren! 
// må kun liste ut den aktuelle listen som skal endres på. 

app.get('/editor', async function (req, res) {

    let sql = 'SELECT * FROM lists'; // WHERE id = $1 - brukeren er burkerID?

    try {
        let result = await pool.query(sql);
        res.status(200).json({ msg: "insert OK" });
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});

// --- DELETE endpoint for deleteing list item ----------------------

app.delete('/editor', async function (req, res) {

    let updata = req.body;

    let sql = 'DELETE FROM lists RETURNING *';
    let values = [updata.listItem];

    try {
        let result = await pool.query(sql, values);
        if (result.rows.lenght > 0) {
            res.staus(200).json({ msg: "Delete OK" }); // send respons
        } else {
            throw "Delete failed"
        }
    } catch (error) {
        res.status(500).json({ error: err }); // send error response
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
            res.status(200).json({ msg: "Insert OK", body: updata, result: result, userid: idUser }); //send response
            console.log(result);
        }
        else {
            throw "Insert failed";
        }

    }
    catch (err) {
        res.status(500).json({ error: err }); //send error response
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
        else {                                                                           // hvis det eksisterer så sjekk passordet: 
            let check = bcrypt.compareSync(updata.password, result.rows[0].password);    //Hvilken possisjon er passordet å i resultatet??
            if (check == true) {                                                          // hvis det er samme passord som på DB
                let payload = { userid: result.rows[0].id };                               //lag en payload som du må ha med til brukersiden
                let tok = jwt.sign(payload, secret, { expiresIn: "12h" });                  // lag en token som gjør at brukeren forblir pålogget
                res.status(200).json({ email: result.rows[0].email, userid: result.rows[0].id, token: tok }); // send alt til clienten
            } else {
                res.status(400).json({ msg: "wrong password" });                                // SPØRSMÅL!! hvorfor lage payload? hvor blir payload overført til client? 
                                                                                                //id og email overfører vi jo i res ???
            }
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});

//--- USERPROFILE endpoints ----------------------------------------------
// --- post -----------------------

app.put('/editprofileinfo', async function (req, res) {

    let sql = "SELECT * FROM users WHERE id = $1 RETURNING *";
    let values = [updata.username, updata.password, updata.email];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response in json

    } catch (err) {
        res.status(500).json(err); //send err in json

    }

});

// --- get ---------------------------

app.get('/profileinfo', async function (req, res) {

    let userId = 25;

    let sql = "SELECT username, email FROM users WHERE id = "+userId+"";

    try {
        let result = await pool.query(sql);
        res.status(200).json(result.rows); //send response in json
        console.log(result);

    } catch (err) {
        res.status(500).json(err); //send err in json

    }

});

// start server -----------------------------------

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), () => console.log('server running on port', app.get('port')));
