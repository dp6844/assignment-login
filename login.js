require('dotenv').config()

const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const app = express();
let cors = require('cors')

app.use(cors())
app.use(express.json());


const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: '35.194.85.1',
    user: 'root',
    password: 'deep6844',
    database: 'assignment2'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Mysql Connected Successful');
});

const jsonParser = bodyParser.json()

app.post('/api/login', jsonParser, (req, res) => {
    console.log({ req })
    let email = req.body.email;
    let password = req.body.password;
    let sqlSelect = 'SELECT * FROM user_details WHERE email ="' + email + '";';
    let sqlSelect1 = 'SELECT * FROM user_details WHERE email ="' + email + '" and password ="' + password + '";';
    let querySelect = db.query(sqlSelect, (err, result) => {
        if (result != "") {
            let queryselect1 = db.query(sqlSelect1, (err, result1) => {
                if (result1 != "") {
                    const user = { email }
                    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
                    let state = "online";
                    let today = new Date();
                    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    let dateTime = date + ' ' + time;
                    let sqlSelect2 = 'SELECT * FROM user_state WHERE email ="' + email + '";';
                    let sql = 'INSERT INTO user_state values( "' + email + '", "' + state + '", "' + dateTime + '", " ","' + accessToken + '");';
                    let sql1 = 'UPDATE user_state SET state ="' + state + '", login_time = "' + dateTime + '", logout_time = " ", access_token = "' + accessToken + '" WHERE email = "' + email + '";';

                    let querySelect =  db.query(sqlSelect2, async (err, result) => {
                        console.log(result);
                        if (result == "") {
                            try{
                                let query = await db.query(sql);
                                console.log(`User state (${email}, ${dateTime}) inserted in the table`);
                            }catch(err){
                                console.log(err)
                            }
                        } else {
                            try{
                                let query = await db.query(sql1);
                                console.log(`User state (${email}, ${state}, ${dateTime}) inserted in the table`); 
                            }catch(err){
                                console.log(err);
                            }
                        }                        
                    });
                    res.json({ user: result[0].name, accessToken: accessToken })
                } else {
                    res.send(`Password for user ${email} is incorrect`);
                }
            });
        } else {
            console.log('You are new user register before login');
            res.status(404).send('You are new user register before login');
        }
    });
});

function authenticateToken(req, res, next) {
    const token = req.headers['token']
    if (token == null) return res.status(401).send("You are Unauthorized user")
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send("You are Unauthorized user")
        req.user = user;
        next();
    })
}

app.get('/api/logout', jsonParser, authenticateToken, (req, res) => {
    let email = req.user.email;
    let access_token = req.headers.token;
    let state = "offline";
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;
    let sqlSelect = 'SELECT access_token FROM user_state WHERE email ="' + email + '";';
    let sql = 'UPDATE user_state SET state ="' + state + '", logout_time = "' + dateTime + '", access_token = " " WHERE email = "' + email + '";';
    let querySelect = db.query(sqlSelect, (err, result) => {
        let token = result[0].access_token;
        if (token) {
                let query = db.query(sql, (err, userstate) => {
                    if (err) {
                        throw err;
                    }
                    console.log(`User logout successful (${email}, ${state}, ${dateTime}) inserted in the table`);
                    res.send("logout successful");
                });
        } else {
            console.log('Login First');
            res.status(404).send('Login First');
        }
    });

});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('listening on port....' + 3001));