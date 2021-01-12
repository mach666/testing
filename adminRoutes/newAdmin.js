const EXPRESS=require('express')
const ROUTER=EXPRESS.Router();
const Admin=require('../dbmodels/admindbmodel')
const jwtValidator=require('../middleware/jwtValidator')
const jwt=require('jsonwebtoken')
const otpGenerator=require('otp-generator')
const unirest=require('unirest')
const bcrypt=require('bcryptjs')
require('dotenv').config()




ROUTER.post('/ragister',jwtValidator,(req,res)=>{
    const _id=req.user.id;
     Admin.findOne({_id})

     .then(admin=>{
        if(admin){
           const number="7903657891";
           global.OTP2=otpGenerator.generate(5,{upperCase:false,specialChars:false,alphabets:false,digits:true});
           const GENERATEDotp=global.OTP2;
           const sms = unirest("POST", "https://www.fast2sms.com/dev/bulk");

           sms.headers({
             "content-type": "application/x-www-form-urlencoded",
             "cache-control": "no-cache",
             "authorization": process.env.SMSKEY
           });
           
           sms.form({
             "sender_id": "SMSINI",
             "language": "english",
             "route": "qt",
             "numbers": number,
             "message": "42990",
             "variables": "{#AA#}",
             "variables_values":GENERATEDotp
           });
           sms.end(function (res) {
               if (res.error) throw new Error(res.error);
               console.log("OTP IS SEND");
             });
 jwt.sign({id:_id},process.env.SECRETKEY,{expiresIn:'600000'},(err,token)=>{
     if(err) throw err;
     res.json({token , "newAdd" : true})
 })
       
        }else{
            res.json({msg:"admin is not found" , "newAdd" : false})
        }
        
     }).catch(Err=>{console.log(Err)})


 
})

ROUTER.post('/ragisterotpvalidator',jwtValidator,(req,res)=>{
  const otp=req.body.otp;
  const id2=req.user.id;
  const gENERATEOTp=global.OTP2;
  if(gENERATEOTp===otp){
   jwt.sign({id:id2},process.env.SECRETKEY,{expiresIn:'12h'},(err,token)=>{
       if(err) throw err;
       res.json({token , "newAddOtp" : true})
   })
  }
  else{
      res.json({msg:"PLEASE ENTER A VALID OTP" , "newAddOtp" : false})
  }
})



ROUTER.post('/ragisteringnewadmin',jwtValidator,(req,res)=>{
   const newName=req.body.name;
   const newNumber=req.body.number;
   const newEmail=req.body.email;
   const newPassword=req.body.password;

   bcrypt.genSalt(10,(err,salt)=>{
     if(err) throw err
     bcrypt.hash(newPassword,salt,(err,hash)=>{
       if(err) throw err
       const NewPassword=hash
       const newAdmin=new Admin({ 
        name:newName,
        number:newNumber,
        email:newEmail,
        password:NewPassword
     })
        newAdmin.save()
        .then(res.json({msg:"NEW ADMIN IS ADDED" , "added" : true}))
        .catch(Err=>{res.json(Err)})
     })
   })
  
})
module.exports=ROUTER
