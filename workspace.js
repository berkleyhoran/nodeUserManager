const express = require('express');
const path = require('path');
const moment = require('moment');
var router = express.Router();
var fs = require('fs');
var util = require('util');


let app = express(); 

app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(express.static('public'));


app.set('views', path.join(__dirname, 'views' ));
app.set('view engine', 'pug')

var users = [];
var user = {};
var index;

app.get('/', (req, res) => {
    res.send('Erorr 404 go to /login')
});

app.get('/login', (req, res) => {
    res.render('index');
    updateArray();
})

app.post('/create', (req, res) => {
    createdUser(Math.abs(Math.floor(Math.random() * (0 - 1000 + 1)) + 0), req.body.age, req.body.name, req.body.email)
    res.render('create');
})

app.get('/users', (req, res) => {

        updateArray();

        fixArray();

        console.log(users)

        res.render('users', { users: users })

});

app.get('/edit/:uid', (req, res) => {

    fixArray();

    console.log(users)

    index;
    
    for (let i = 0; i < users.length; i++) {
        console.log('searching')
        console.log(req.params.uid)
        console.log(users[i].uid)
        if(Number(req.params.uid) === Number(users[i].uid)){
            index = i;
            break;
        }
    }

    res.render('edit', { user: users[index]})
  
})


app.post('/rewrite', (req, res) => {

    console.log(users[index].age);
    console.log(req.body.age)

    users[index].name = req.body.name;
    users[index].age = req.body.age;
    users[index].email = req.body.email;

    reWriteArray();

    res.render('rewrite')
  
})

app.get('/delete/:uid', (req, res) => {

    fixArray();

    console.log(users)

    index;
    
    for (let i = 0; i < users.length; i++) {
        console.log('searching')
        console.log(req.params.uid)
        console.log(users[i].uid)
        if(Number(req.params.uid) === Number(users[i].uid)){
            index = i;
            deleteIndex(index)
            break;
        }
    }

    res.render('delete')
  
})

function updateArray(){
    fs.readFile('users.txt', 'utf8', function (err, data) {
        if (err) throw err;
        users = data.toString().split("\n");
      });  
}

function createdUser(u,a,n,e){ 

    user = {
        uid: u,
        age: a,
        name: n,
        email: e
    } 
    
    users.push(user)
    console.log(user)
    console.log(users)
    
    fs.appendFile('users.txt', JSON.stringify(user).toString() + "\n" , 'utf-8', error => {
        if (error) throw err;
    });
}

function fixArray(){
    for (let e = 0; e < users.length; e++) {
        console.log(e + JSON.stringify(users[e]))
        if(users[e] == ''){
            console.log('empty line')
            users.splice(e, 1);
        }
        if(users[e] === null || users[e] === undefined){
            console.log('he gone')
        }
        else if((typeof users[e]) !== 'object' && users[e] !== null){
            console.log('it isnt an object')
            users[e] = JSON.parse(users[e])
        } 
    }
}

function deleteIndex(index){
    updateArray();
    fixArray();

    users.splice(index, 1)

    reWriteArray();

    console.log('user deleted')
}

function reWriteArray(){

    fs.writeFile('users.txt', '', function(){console.log('done')})
    
    for (let c = 0; c < users.length; c++) {
        fs.appendFile('users.txt', JSON.stringify(users[c]).toString() + "\n" , 'utf-8', error => {
            if (error) throw err;
        });
    }

    fixArray();

}


app.listen(4000 , () => {
    console.log("Listening on port 4000")
});