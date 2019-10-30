const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const appRoot = path.resolve(__dirname);

const DEFAULT_PORT = 8000;

const HTTP_CODES = {
    NOT_FOUND: 404,
    OK: 200
};

//------------------

app.set('port', (process.env.PORT || DEFAULT_PORT));

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/userid', ut.userAuth, db.getUser, ut.logEvent);
app.get('/userid/preslist', ut.userAuth, db.getPresList, ut.logEvent);
app.get('/userid/presentation', ut.userAuth, db.getPresenation, ut.logEvent);

app.get('/', (req, res) => {
    res.sendFile(appRoot + '/public/login.html');
});

app.get('/editor', (req, res) => {
    res.sendFile(appRoot + '/public/editor.html');
});

app.post('/userid', db.newUser, ut.logEvent);
app.post('/user/presentation', ut.userAuth, db.updatePresentation, ut.logEvent, db.newPresentation, ut.logEvent);

app.delete('/user/presentation', ut.userAuth, db.deletePresentation, ut.logEvent);

//----------------------


app.listen(app.get('port'), function () {
    console.log('server running', app.get('port'));
});