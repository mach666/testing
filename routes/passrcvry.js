const EXPRESS=require('express');
const ROUTER=EXPRESS.Router();
const unirest=require('unirest')
const otpGeneratorPassRcvry = require('otp-generator');
const Consumer=require("../dbmodels/customerdbmodel");
const jwt=require('jsonwebtoken');
const jwtValidator = require('../middleware/jwtValidator');
const bcrypt=require('bcryptjs')
require('dotenv').config()

ROUTER.post('/',(req,res)=>{
const {number}=req.body;
global.number=number
Consumer.findOne({number}).then(consumer=>{
    if(consumer){
        global.OTPPassRcvry=otpGeneratorPassRcvry.generate(5,{upperCase:false,specialChars:false,digits:true,alphabets:false})
    const PassRcvryOTP=global.OTPPassRcvry;
    const NUM=consumer.number;
 
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
  "numbers": NUM,
  "message": "42990",
  "variables": "{#AA#}",
  "variables_values":PassRcvryOTP
});
sms.end(function (res) {
    if (res.error) throw new Error(res.error);
    console.log("OTP IS SEND");
  });

   
    
    //Creating jwt and sending it;
    jwt.sign({id:number},process.env.SECRETKEY,{expiresIn:'3h'},(err,token)=>{
        if(err) throw err;
        res.json({token , login: false , num : true })
    })
}
    
    else{
        res.json({msg:"INVALID NUMBER" , login : false , num : false})
    }
})
})


ROUTER.post('/passrcvryOtpValidator',jwtValidator,(req,res)=>{
    const {otp}=req.body;
    const PassRcvryOTPinValidator=global.OTPPassRcvry
    if(PassRcvryOTPinValidator===otp){
        const number=global.number;
        jwt.sign({id:number},process.env.SECRETKEY,{expiresIn:'600000'},(err,token)=>{
            if(err) throw err;
            res.json({token , login : false , otp : true})   
        })
       
    }
    else{
        res.json({msg:"INVALID OTP" , login : false , otp : false})
    }
    
})

ROUTER.post('/updator',jwtValidator,(req,res)=>{
    const {newPassword}=req.body;
    const number=req.user.id
    bcrypt.genSalt(10,(err,salt)=>{
        if(err) throw err
       bcrypt.hash(newPassword,salt,(err,hash)=>{
           if(err) throw err
          encryptNewPass=hash
          Consumer.findOneAndUpdate({number},{password:encryptNewPass},{returnOriginal:false})
          .then(Res=>{res.json({msg:"Password is changed successfully" , login: false , passchng : true})})
          .catch(err=>{console.log(err)})
        })
    })
     
   
})

module.exports=ROUTER
