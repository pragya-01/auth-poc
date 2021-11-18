const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const passport = require('passport');
const axios = require('axios');
const { forwardAuthenticated, ensureAuthenticated} = require('../config/auth');
const {parse} = require("nodemon/lib/cli");

//login handle
router.get('/login',  (req,res)=>{
    res.render('login');
})
router.get('/register' , (req,res)=>{
    res.render('register');
})

//Register handle
router.post('/register',(req,res)=> {
    const {name, email, password, password2} = req.body;
    let errors = [];
    console.log(' Name ' + name + ' email :' + email + ' pass:' + password);
    if (!name || !email || !password || !password2) {
        errors.push({msg: "Please fill in all fields"})
    }
    //check if match
    if (password !== password2) {
        errors.push({msg: "passwords dont match"});
    }

    //check if password is more than 6 characters
    if (password.length < 6) {
        errors.push({msg: 'password atleast 6 characters'})
    }
    if (errors.length > 0) {
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            password: password,
            password2: password2
        })
    } else {
        //validation passed
        User.findOne({email: email}).exec((err, user) => {
            console.log(user);
            if (user) {
                errors.push({msg: 'email already registered'});
                render(res, errors, name, email, password, password2);

            } else {
                const newUser = new User({
                    name: name,
                    email: email,
                    password: password
                });
                bcrypt.genSalt(10,(err,salt)=>
                    bcrypt.hash(newUser.password,salt,
                        (err,hash)=> {
                            if(err) throw err;
                            //save pass to hash
                            newUser.password = hash;
                            //save user
                            newUser.save()
                                .then((value)=>{
                                    console.log(value)
                                    req.flash('success_msg','You are now registered!')
                                    res.redirect('/users/login');
                                })
                                .catch(value=> console.log(value));

                    }));
            }
        })
    }
})

router.post('/login',(req,res,next)=>{
    passport.authenticate('local', {
        successRedirect: '/users/login-otp',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

//logout
router.get('/logout', (req,res)=>{
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})

//----------------------------------------------------------------------------------------------------------
async function makePostRequest(email) {

    let payload = { email: email, type: "VERIFICATION" };
    let res = await axios.post('http://node-otp-service.herokuapp.com/api/v1/email/otp', payload);

    let data = res.data;
    console.log(data);
    return data;

}


//----------------------------------------------------------------------------------------------------------
let ver_key;

router.get('/login-otp', (req, res) => {
    let email = "itzricha12@gmail.com";
    const data = makePostRequest(email);
    console.log(data);
    data.then( res => {
        ver_key = res.Details;
    })
    res.render('otp');
})

router.post('/login-otp', (req, res) => {
    let _otp = req.body.otp;
    let _email = "itzricha12@gmail.com";
    let payload = { otp: _otp, verification_key: ver_key,  check: _email  };
    axios.post('http://node-otp-service.herokuapp.com/api/v1/verify/otp', payload)
        .then(function (response) {
            console.log(response);
            if(response.data.Status == "Success") {
                res.redirect('/dashboard');
            }
        })
        .catch(err => {
            res.send(err);
        })
})


module.exports  = router;