const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const HTTP_CODES = {
    NOT_FOUND: 404,
    OK: 200
};

app.use(express.static('public'));
app.use(bodyParser.json());




TEST
