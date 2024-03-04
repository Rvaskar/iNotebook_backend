//importing all the modules which require
const express = require('express');  //importing express from express //! - npm i express
const router = express.Router();   
const User = require('../models/User');
const { body, validationResult } = require('express-validator'); //importing data validator for validate user input data
const bcrypt = require('bcryptjs');  //importing bcryptjs for hashing password value

const jwt = require('jsonwebtoken');  //importing jwt token from jsonwebtoken //! --npm i jsonwebtoken
const fetchuser = require('../middleware/fetchuser');
const jwt_SECRET = 'Harryisgoodb$oy'   //create a predefine value for jwt auth token  as like salt 




//!ROUTE1: CREATING ENDPOINT FOR USER SIGNUP

//Create a User using : POST "/api/auth/createuser". Doesn't require Auth
router.post('/createuser',[
    // name must be at least 5 chars long
    body('name','Enter valid name').isLength({ min: 3 }),
    body('email','Enter valid email').isEmail(),
    // password must be at least 5 chars long
    body('password','at least 5 characters').isLength({ min: 5 }),
],async (req, res)=>{

  let success = false;
  // If there are errors, return Bad request and the errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    
    //Check whether the user with same email exits already
    try {
      let user = await User.findOne({email: req.body.email});
      if(user){
          return res.status(400).json({success, error: "Sorry a user with this email already exists"})
      }

      //Using bcrypt for password hash

      const salt = await bcrypt.genSalt(10);   //creating salt value
      const secPass = await bcrypt.hash(req.body.password, salt);
      //Create a new User
      user = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: secPass,
        })
        
        //we are not using below statement instead we use async await
      //   .then(user => res.json(user))
      //   .catch(err => {console.log(err)
      // res.json({error: 'please enter uniq value for email', message: err.message})})

      const data = {
        user:{
          id: user.id
        }
      }

      //creating auth token to give access of website to user 
      const authToken = jwt.sign(data, jwt_SECRET);
      // console.log(authToken)

      // res.json(user)
      success = true;
      res.json({success, authToken})  //here actually we write as res.json(authToken:authToken)

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Sever Error.")
    }

})


//!ROUTE2: CREATING ENDPOINT FOR USER LOGIN AUTHENTICATION 


  //Authenticate a user : POST "/api/auth/login". Doesn't require Auth
  router.post('/login',[

    // name must be at least 5 chars long
    body('email','Enter valid email').isEmail(),
    // password must be at least 5 chars long
    body('password','Password cannot be blank').exists(),  //.exist use to check value blank or not 
],async (req, res)=>{
  
  let success = false;

  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {email, password} = req.body;
  try{
    let user = await User.findOne({email});
    if(!user){
  
      return res.status(400).json({error: "Please try to login with correct credentials"}) //we checking user is exits or not 
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      
      return res.status(400).json({success, error: "Please try to login with correct credentials"}) //we checking password is correct or not 
    }

    const data = {
      user:{
        id: user.id
      }
    }

    //creating auth token to give access of website to user 
    const authToken = jwt.sign(data, jwt_SECRET);

    // res.json(user)
    success = true;
    res.json({success, authToken})  //here actually we write as res.json(authToken:authToken)

  }catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server Error ")
  }

})

//!ROUTE3: CREATING ENDPOINT FOR GETTING  USER DETAILS


  //Get logged in user details using : POST "/api/auth/getuser". require login
  router.post('/getuser', fetchuser, async (req, res)=>{
  try {
    let userId = req.user.id;
    const user = await User.findById(userId).select('-password');  //* -password means  do not show the password field in response
    // res.send(user)   //* by this we can get all user value

    //! here we access only data that we needed
    const { name, email, date } = user;  // Destructuring the user object to get individual values
    res.send({
      name: name,
      email: email,
      date: date
    });
  }catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server Error ")
  }
})

module.exports = router