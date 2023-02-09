import mongoose from 'mongoose';
import express from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';


//configurations

dotenv.config();

//database configuration

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


//databse configuration

mongoose.connect('mongodb://127.0.0.1:27017/newData');


//created a userschema 
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

app.get("/",(req, res) => {
        res.render("home");
    });
app.get("/login",(req, res) => {
        res.render("login");
    });
app.get("/phone",(req, res) => {
        res.render("phone");
    });
app.get("/register",(req, res) => {
        res.render("register");
    });
app.get("/secrets",(req, res) => {
        if (req.isAuthenticated()) {
            User.find({ "idea": { $ne: null } }, (err, founduser) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if (founduser) {
                            res.render("secrets", { userwithidea: founduser });
                        }
                    }

                });
        } else {
            res.redirect("/login");
        }
        //------------------only if user is valid and matches with data base then redirect------------
        // if(req.isAuthenticated()){
        //     res.render("secrets");
        // }else{
        //     res.redirect("/login");
        // }    
    });
app.get("/pitch",(req, res) => {
        if (req.isAuthenticated()) {
            res.render("submit");
        } else {
            res.redirect("/login");
        }
    });

app.post("/submit",(req, res) => {
        const pitchIdea = req.body.pitchIdea;
        // console.log(req.user.id);
        User.findById(req.user.id, (err, fonduser) => {
                if (err) {
                    console.log(err);
                } else {
                    if (fonduser) {
                        fonduser.idea = pitchIdea;
                        fonduser.save(() => {
                            res.redirect("/secrets");
                        });
                    }
                }
            });
    });



app.get("/logout",(req, res) => {
        req.logout((err) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    });


app.post("/register",(req, res) => {

        User.register({ username: req.body.username }, req.body.password, (err, user) => {
                if (err) {
                    console.log(err);
                    res.redirect("/register");
                } else {
                    passport.authenticate("local")(req, res, () => {
                            res.redirect("/secrets");
                        });
                }

            });

    });

app.post("/login",(req, res) => {

        const user = new User({
            username: req.body.username,
            password: req.body.username
        });

        req.login(user, (err) => {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, () => {
                        res.redirect("/secrets");
                    });
            }

        });


    });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`App listening at port ${PORT}`));



