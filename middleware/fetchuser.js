const jwt = require('jsonwebtoken');  //importing jwt token from jsonwebtoken //! --npm i jsonwebtoken
const jwt_SECRET = 'Harryisgoodb$oy'   //create a predefine value for jwt auth token //*  as like salt



const fetchuser = (req, res, next) =>{
    // Get the user from the jwt token and add id to request object 
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "Please authenticate using a valid token"});
    }
    try {
        const data = jwt.verify(token, jwt_SECRET);
        req.user = data.user;
        next()
    } catch (error) {
        res.status(401).send({error: "Please authenticate using a valid token"});
    }
    
}
module.exports = fetchuser; 