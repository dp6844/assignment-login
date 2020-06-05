const express = require('express');
const session = require('express-session')
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const two_hours = 1000*60*60*2

const {
    SESS_NAME = 'sid',
    SESS_SECRET = 'secret',
    SESS_LIFETIME = two_hours,
} = process.env

app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie:{
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: false
    }
}))

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
    console.log(req.session);
    if (!req.session.userID){
        let email = req.body.email;
        let password = req.body.password;
        let sqlSelect = 'SELECT * FROM user_details WHERE email ="' + email + '";';
        let sqlSelect1 = 'SELECT * FROM user_details WHERE password ="' + password + '";';
        let querySelect = db.query(sqlSelect, (err, result) => {
            console.log(result);
            if (result != "") {
                let queryselect1 =db.query(sqlSelect1,(err, result1) =>{
                    if(result1 != ""){
                        console.log(result1);
                        let state = "online";
                        let today = new Date();
                        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                        let dateTime = date+' '+time;
                        let sqlSelect2 = 'SELECT * FROM user_state WHERE email ="' +  email + '";';
                        let sql = 'INSERT INTO user_state values( "' + email + '", "' + state + '", "' + dateTime +'", " ");';
                        let sql1 = 'UPDATE user_state SET state ="'+ state +'", login_time = "'+ dateTime +'", logout_time = " " WHERE email = "'+ email +'";';
                        
                        let querySelect = db.query(sqlSelect2, (err, result) => {
                            console.log(result);
                            if (result == "") {
                                let query = db.query(sql, (err, userstate) => {
                                if (err) {
                                    throw err;
                                }
                            console.log(`User state (${email}, ${dateTime}) inserted in the table`);
                            });
                            }else{
                                let query = db.query(sql1, (err, userstate) => {
                                    if (err) {
                                        throw err;
                                    }
                                console.log(`User state (${email}, ${state}, ${dateTime}) inserted in the table`);
                                });
                            }
                        });
                        req.session.userID = email;
                        res.send(`Hi,welcome ${result[0].name} you are logged-in.`);
                    }else{
                        res.send(`Password for user ${email} is incorrect`);
                    }    
                });
            } else {
                console.log('You are new user register before login');
                res.status(404).send('You are new user register before login');
            }
        });
    }else{
        res.send("Your already logged-in")
    }
});

app.post('/api/logout', jsonParser, (req, res) => {
    console.log(req.session)
    if(req.session.userID){
    let email = req.body.email;
    let state = "offline";
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date+' '+time;
    let sql = 'UPDATE user_state SET state ="'+ state +'", logout_time = "'+ dateTime +'" WHERE email = "'+ email +'";';
    let query = db.query(sql, (err, userstate) => {
        if (err) {
            throw err;
         }
    console.log(`User logout successful (${email}, ${state}, ${dateTime}) inserted in the table`);
    req.session.destroy(err =>{
        if(err){
            throw err;
        }
        res.clearCookie(SESS_NAME).send("logout successful");
    })
    });
}else{
    res.send("login first");
}
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('listening on port....' + port));