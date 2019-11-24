//const secretStash = require("./secrets");
const jwt = require('jsonwebtoken');
let secret =  "glederMegtilJul!";

let authObj = {};

authObj.userAuth = function (req, res, next) {

    let token = req.headers['authorization'];

    if (token) {
        try {
            authObj.auth = jwt.verify(token, secret);
            next();
        } catch (err) {
            console.log(err);
            res.status(403).json({ msg: "Not a valid token" });
        }
    }
    else {
        res.status(403).json({ msg: "No token" });
        
    }
}

module.exports = authObj;
