//const db = require("./modules/db")(process.env.dbConnection);
//const routes = require('./modules/api');

const dbConnection = process.env.DATABASE_URL || secrets.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: dbConnection });

const pg = require('pg');

const db = function (dbConnectionString) {

    const connectionString = dbConnectionString;

    async function runQuery(query, params) {                                       // mangler test: ble jeg egentlig connected - normal fallback. 
        const client = new pg.Client(connectionString);
        await client.connect();                                                   // did i connect? throw an error. 
        const res = await client.query(query, params);                            // tar første respons fra databasen og putter det inn i array MEN dette er bad-code, for hcva om det ikke er noe
        let respons = res.rows;                                                   // did we get anything back? må sjekkes. 
        await client.end();                                                       // hvis du ikke ender så husker databasen på denne requesten og maser på svar til den eksploderer. du må si ifra til serveren at du er ferdig. 
        return respons;
    }
                                                                                 //connect to db and return info *: all informasjon, også password hash. #
    const getUserByID = async function (userID) {
        userData = null;
        try {
            let userData = await runQuery("SELECT * from UserTbl where userID=$1", [userId])
        } catch (error) {
            // deal with error 
            // her kan du sjekke om det har kommet noe data tilbake. 
        }
        return userData;
    }

    const getUseTaskForUser = async function (userID) {
        return await runQuery("SELECT * from UserTasks where userID=$1", [])

    }
    return {
        getuser: getUserByID
    }
};

    module.exports = db;
