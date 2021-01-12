const EXPRESS=require('express');
const jwtValidator = require('../middleware/jwtValidator');
const ROUTER=EXPRESS.Router();
const otpGenerator=require('otp-generator');
const unirest=require('unirest')
const jwt=require('jsonwebtoken')
const Consumer=require('../dbmodels/customerdbmodel')
require('dotenv').config()

ROUTER.post('/',jwtValidator,(req,res)=>{
global.consumerId=req.user.id
const number=req.body.newNumber;


Consumer.findOne({number})
.then(consumer=>{
    if(!consumer){
       
        OTP=otpGenerator.generate(5,{specialChars:false,alphabets:false,digits:true,upperCase:false});
        global.otp=OTP
        
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
  "variables_values":OTP
});
sms.end(function (res) {
    if (res.error) throw new Error(res.error);
    console.log("OTP IS SEND");
  });
        
        jwt.sign({id:number},process.env.SECRETKEY,{expiresIn:'72h'},(err,token)=>{
            if(err) throw err;
            res.json({token , login :true , newnum : true})
        })
    }
    else{
        res.json({msg:'Already Registered' , login : true , newnum : false})
    }
})
})

ROUTER.post('/nmbrupdationOtpValidator',jwtValidator,(req,res)=>{
const    newNumber=req.user.id;
const    generatedOTP=global.otp;
const    consumerId=global.consumerId;

if(req.body.otp===generatedOTP){
Consumer.findByIdAndUpdate(consumerId,{number:newNumber},{returnOriginal:false})
.then(Res=>{res.json({msg: "number changed" , newchngnum : true , login :false})})
.catch(err=>{console.log(err)})
}
else{
    res.json({msg: "INVALID OTP" , newchngnum : false , login : false})
}


})


module.exports=ROUTER






