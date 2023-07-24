require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs")
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const findOrCreate = require('mongoose-findorcreate')
const alert= require('alert')
const app = express();



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
app.set('view engine', 'ejs');

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/Solefinds');

const userSchema = new mongoose.Schema ({
    username: String,
    email: String,
    password: String,
    location: String,

});

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });


app.get("/", function(req, res){
    res.render("index")
}
)


app.get("/login", function(req, res){
    if(req.isAuthenticated){
        res.redirect("/home")
    } else {
        res.render("signin")
    }
}

)

app.get("/register", function(req, res){
    if(req.isAuthenticated){
        res.redirect("/home")
    } else {
        res.render("register")
    }
    
}

)

app.get("/home", function(req, res){
    if(req.isAuthenticated){
        res.render("dashboard")
    } else {
        res.redirect("/login")
    }
    
}

)

app.post("/register", function(req, res){
    User.register({username: req.body.username, email: req.body.email, location: req.body.location}, req.body.password, function(err, user){
        if(err){
            console.log(err)
            res.redirect("/register")
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/home")
            })
        }
    })
})

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, function(err){
        if(err){
            console.log(err)
        } else{

            passport.authenticate("local")(req, res, function(){
                res.redirect("/home")
            })
        }
    })
})

app.get("/logout", function(req, res){
    if(req.isAuthenticated()){
        
            req.logout(function(err){
                console.log(err);
            });
            res.redirect("/")
        
    }else{
        res.redirect("/")
    }
    
})

























app.listen( process.env.PORT || 3000, function(){
    console.log("Server is running at port 3000")
})
