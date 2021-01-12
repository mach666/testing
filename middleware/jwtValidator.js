const jwt=require('jsonwebtoken')
require('dotenv').config()
function jwtValidator(req,res,next){
    const token=req.header('x-auth-token');
 try{
        //Varify token
       const decoded=jwt.verify(token,process.env.SECRETKEY);
        //Add user from payload  
      req.user=decoded;
      next()
    }
    catch(e){
      res.status(400).json({msg:'Token is not valid',login: false})
    }
}
module.exports=jwtValidator;