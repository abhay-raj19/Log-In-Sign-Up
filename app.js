const express =require("express");
const bodyParser =require("body-parser");
const ejs =require("ejs")
const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/userDB");
//created a mongoose user schema
const userSchema = {
    email : String,
    password : String
};
//created a model for user by using schema

const User = new mongoose.model("User",userSchema);

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
//home route
app.get("/",function (req,res) {
    res.render("home");
});
//login route
app.get("/login",function (req,res) {
    res.render("login");
});
//register route(get)
app.get("/register",function (req,res) {
    res.render("register");
});
//register route for posting 
app.post("/register",function (req,res) {
    const newUser = new User({
        email:req.body.username,
        password:req.body.password
    });
    newUser.save(function (err) {
        if(err){
            console.log(err);
        } else {
            res.render("secrets");
        }    
    });
});


app.post("/login",function (req,res) {
    const username = req.body.username;
    const password = req.body.password;  

    User.findOne({email:username},function (err,foundUser){
        if (err) {
            console.log(err);       
        } else {
            if (foundUser) {
                if (foundUser.password === password ){
                    res.render("secrets");
                }
            }
        }
        
    });

}); 









app.listen(process.env.PORT || 3000 , function () {
    console.log("Server Started At Port 3000");
});