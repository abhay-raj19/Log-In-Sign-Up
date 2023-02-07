require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs =require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const md5 = require('md5');
// const bcrypt = require('bcryptjs');
// const saltRounds = 10;

const mongoose = require('mongoose');
mongoose.set("strictQuery", false);


const app = express();
 

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  }));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/newData');


//created a schema 
const userSchema = new mongoose.Schema( {
    email:String,
    password:String,
    idea:String
});

userSchema.plugin(passportLocalMongoose);

//created model using schema 
const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function (req,res) {
    res.render("home");
});
app.get("/login",function (req,res) {
    res.render("login");
});
app.get("/register",function (req,res) {
    res.render("register");
});
app.get("/secrets",function (req,res) {
    if(req.isAuthenticated()){
    User.find({"idea":{$ne:null}},function (err,founduser) {
        if(err){
            console.log(err);
        } else {
            if(founduser){
                res.render("secrets",{userwithidea:founduser});
            }
        }
    
    });
}else{
    res.redirect("/login");
}
    //------------------only if user is valid and matches with data base then redirect------------
    // if(req.isAuthenticated()){
    //     res.render("secrets");
    // }else{
    //     res.redirect("/login");
    // }    
});
app.get("/pitch",function (req,res) {
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }    
});

app.post("/submit",function (req,res) {
    const pitchIdea = req.body.pitchIdea;
    // console.log(req.user.id);
    User.findById(req.user.id,function (err,fonduser) {
        if(err){
            console.log(err);
        }else{
            if(fonduser){
                fonduser.idea = pitchIdea;
                fonduser.save(function () {
                    res.redirect("/secrets");
                });
            }
        }
    });
});



app.get("/logout",function(req,res) {
    req.logout(function(err) {
        if(err) {
            console.log(err);
        }else{
            res.redirect('/');
        }
      });
});



app.post("/register",function (req,res) {

    User.register({username:req.body.username},req.body.password, function(err, user) {
        if(err){
            console.log(err);
            res.redirect("/register");
        } else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }

        });
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser = new User({
    //         email:req.body.username,
    //         password:hash 
    //     });
    //     newUser.save(function (err) {
    //         if(err){
    //             console.log(err);
    //         } else {
    //             res.render("secrets");
    //         }    
    //     });
   // });


    // const newUser = new User({
    //     email:req.body.username,
    //     password:md5(req.body.password)
    // });
    // newUser.save(function (err) {
    //     if(err){
    //         console.log(err);
    //     } else{
    //         res.render("secrets");
    //     }
    // });
});

app.post("/login",function (req,res) {

    const user = new User({
        username:req.body.username,
        password:req.body.username
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
        
      });




    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({email:username},function (err,fonduser) {
    //     if(err){
    //         console.log(err);
    //     }else{
    //         if(fonduser){
    //             bcrypt.compare(password, fonduser.password, function(err, result) {
    //                 if (result === true) {
    //                     res.render("secrets");
    //                 }
    //             });

    //         }
    //     }        
    // });    
});






app.listen( process.env.PORT || 3000,function () {
    console.log("Server Started : 3000")
});






//-----------------------------------------EnD---------------



// 
// const express = require("express");
// const bodyParser = require("body-parser");
// const ejs = require("ejs");
// 
// 
// const findOrCreate = require("mongoose-findorcreate");
// const mongoose = require("mongoose");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// mongoose.set("strictQuery", false);

// //created a model for user by using schema

// const app = express();

// app.use(express.static("public"));
// app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(session({
//     secret: "our little secret.",
//     resave: false,
//     saveUninitialized: false

// }));

// app.use(passport.initialize());
// app.use(passport.session());


// mongoose.connect("mongodb://127.0.0.1:27017/userDB");




// const userSchema = new mongoose.Schema({
//     email: String,
//     password: String
// });

// userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

// const User = new mongoose.model("User", userSchema);
// passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "https://localhost:3000/auth/google/secrets",
//     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
// },
//     function (accessToken, refreshToken, profile, cb) {
//         User.findOrCreate({ googleId: profile.id }, function (err, user) {
//             return cb(err, user);
//         });
//     }
// ));


// app.get("/", function (req, res) {
//     res.render("home");
// });

// app.get('/auth/google',
//     passport.authenticate('google', { scope: ['profile'] }));

// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     function (req, res) {
//         // Successful authentication, redirect home.
//         res.redirect('/');
//     });

// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     function (req, res) {
//         // Successful authentication, redirect home.
//         res.redirect('/');
//     });




// //login route
// app.get("/login", function (req, res) {
//     res.render("login");
// });
// //register route(get)
// app.get("/register", function (req, res) {
//     res.render("register");
// });

// app.get("/secrets", function (req, res) {
//     if (req.isAuthenticated()) {
//         res.render("secrets");
//     } else {
//         res.redirect("/login");
//     }
// });


// app.get("/logout", function (req, res) {
//     req.logout(function (err) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.redirect('/');
//         }

//     });

// });



// //register route for posting 
// app.post("/register", function (req, res) {

//     User.register({ username: req.body.username }, req.body.password, function (err, user) {
//         if (err) {
//             console.log(err);
//             res.redirect("/register");
//         } else {
//             passport.authenticate("local")(req, res, function () {
//                 res.redirect("/secrets");
//             })
//         }
//     })



// });


// app.post("/login", function (req, res) {
//     const user = new User({
//         username: req.body.username,
//         password: req.body.password
//     });

//     req.login(user, function (err) {
//         if (err) {
//             console.log(err);
//         } else {
//             passport.authenticate("local")(req, res, function () {
//                 res.redirect("/secrets");
//             });
//         }
//     });

// });

// app.listen(process.env.PORT || 3000, function () {
//     console.log("Server Started At Port 3000");
// });