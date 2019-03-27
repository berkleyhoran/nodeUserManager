const express = require('express');
const path = require('path');
const moment = require('moment');
const mongo = require('mongodb').MongoClient;
var db;

const url = 'mongodb://localhost:27017'
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
var sort = "ascending";
var index;

mongo.connect(url, (err, client) => {
    if (err) {
      console.error(err)
      return;
    }
    const db = client.db('userList');
    const collection = db.collection('users');

    collection.remove({})

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

        updateDB();

        res.render('users', { users: users , sort: sort})

});

app.get('/users/:sort/:searchterm', (req, res) => {

    updateArray();

    fixArray();

    searchUsers(req.params.searchterm)

    for (let u = 0; u < users.length; u++) {
        sortBy(req.params.sort, users[u], users[u + 1])
    }

    

    res.render('users', {users: users, sort: sort, input: req.params.searchterm})

});

app.get('/users/:sort', (req, res) => {

    fixArray();

    for (let u = 0; u < users.length; u++) {
        sortBy(req.params.sort, users[u], users[u + 1])
    }

    res.render('users', {users: users, sort: sort, input: ''})

});

app.get('/edit/:uid', (req, res) => {

    fixArray();

    index;
    
    for (let i = 0; i < users.length; i++) {
        if(Number(req.params.uid) === Number(users[i].uid)){
            index = i;
            break;
        }
    }

    res.render('edit', { user: users[index]})
  
})


app.post('/rewrite', (req, res) => {

    users[index].name = req.body.name;
    users[index].age = req.body.age;
    users[index].email = req.body.email;

    reWriteArray();

    res.render('rewrite')
  
})

app.get('/delete/:uid', (req, res) => {

    fixArray();

    index;
    
    for (let i = 0; i < users.length; i++) {
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

    updateDB();
    
    fs.appendFile('users.txt', JSON.stringify(user).toString() + "\n" , 'utf-8', error => {
        if (error) throw err;
    });
}

function fixArray(){
    for (let e = 0; e < users.length; e++) {
        if(users[e] == ''){
            users.splice(e, 1);
        }
        if(users[e] === null || users[e] === undefined){
        }
        else if((typeof users[e]) !== 'object' && users[e] !== null){
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

function searchUsers(searchterm){
    let check = 0;
    for (let e = 0; e < users.length; e++) {
        console.log(JSON.stringify(users[e]).toLowerCase())
        if(JSON.stringify(users[e]).toLowerCase().includes(searchterm.toLowerCase())){
            console.log('found match');
            check += 1;
        }
        else{
            console.log('deleted not match')
            users.splice(e, 1)
        }
    }
    if(check == 0){
        users = [];
    }
}

function sortBy(e, a, b){
    if(e == "ascending"){
        if(b == 0){
            console.log('break');
            
        }
        else{
            users.sort((a, b) => (a.name > b.name) ? 1 : -1);
        }
        
    }
    if(e == "descending"){
        if(b == 0){
            console.log('break');
        }
        else{
            users.sort((a, b) => (a.name > b.name) ? 1 : -1).reverse();
        }
    }
}

function updateDB(){
    updateArray()
    fixArray()
    collection.insertMany(users, (err, result) => {

    })
}
// function inputsearch(searchterm){
//     window.location.href = `/users/${searchterm}`;
//     console.log('it wiorked')
// }   


app.listen(4000 , () => {
    console.log("Listening on port 4000")
});

})
