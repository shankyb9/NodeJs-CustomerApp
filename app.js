var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs')
var db = mongojs('customerapp', ['users'])
var ObjectId = mongojs.ObjectId;
var app = express();

/*var logger = function(req, res, next){
  console.log("Logging...");
  next();
};

app.use(logger); // order is imp.
*/


//View Engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set Static path
app.use(express.static(path.join(__dirname, 'public'))); //the files inside it will over-ride the send() part. For eg. index.html

//Global Vars
app.use(function(req, res, next){
  res.locals.errors = null;
  next();
});

//Express Validator MiddleWare
// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
// var person = {
//   name: 'Jeff',
//   age: 30
// }

//ejs: Embedded js : template engine : has similarity to html
// var people = [
//   {
//   name: 'Jeff',
//   age: 30
// },
// {
// name: 'Nick',
// age: 35
// },
// {
// name: 'Nina',
// age: 21
// }
// ]

// var users = [
//   {
//     id: '1',
//     first_name: 'Alex',
//     last_name: 'Hillary',
//     email: 'ahill@yahoo.com'
//   },
//   {
//     id: '2',
//     first_name: 'Clark',
//     last_name: 'Kent',
//     email: 'clark@sakfna.com'  },
//   {
//     id: '3',
//     first_name: 'Lois',
//     last_name: 'Henna',
//     email: 'henl@yahoo.com'
//   }
// ]

app.get('/',function(req,res){
  //res.send('Hello World');
  //res.json(person);
  //res.json(people);

  // find everything
  db.users.find(function (err, docs) {
  	//console.log(docs);
    res.render('index',{
      title: 'Customers',
      //users: users
      users: docs
    });
  })

  // res.render('index',{
  //   title: 'Customers',
  //   users: users
  // });
});

app.post('/users/add',function(req, res){
  //console.log('Form submitted');
  //console.log(req.body.first_name);

req.checkBody('first_name', 'First Name is required').notEmpty();
req.checkBody('last_name', 'Last Name is required').notEmpty();
req.checkBody('email', 'Email is required').notEmpty();

var errors = req.validationErrors();

if(errors){
  db.users.find(function (err, docs) {
  res.render('index',{
    title: 'Customers',
    users: docs,
    errors: errors
  });
});
  //console.log('ERRORS');
}
else{
  var newUser = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email
  }
  db.users.insert(newUser, function(err, result){
    if(err){
      console.log(err);
    }

      res.redirect('/');

  });
  console.log('SUCCESS');
}

  // var newUser = {
  //   first_name: req.body.first_name,
  //   last_name: req.body.last_name,
  //   email: req.body.email
  // }
  //console.log(newUser);
});

app.delete('/users/delete/:id',function(req, res){
  //console.log(req.params.id);
  db.users.remove({_id: ObjectId(req.params.id)},function(err,result){
    if(err){
      console.log(err);
    }
    res.redirect('/');
  });
})


app.listen(3000,function(){
  console.log('Server started on port 3000');
});
