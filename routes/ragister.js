const EXPRESS=require('express');
const ROUTER=EXPRESS.Router();
const unirest=require('unirest')
const otpGenerator = require('otp-generator');
const Consumer=require("../dbmodels/customerdbmodel")
const jwt=require('jsonwebtoken')
const jwtValidator=require('../middleware/jwtValidator')
const bcrypt=require('bcryptjs')
require('dotenv').config()


ROUTER.post('/',(req,res)=>{
    const {number}=req.body
    Consumer.findOne({number}).then(consumer=>{
if(!consumer){
    
global.OTP=otpGenerator.generate(5,{upperCase:false,specialChars:false,alphabets:false,digits:true});
global.BODY=req.body;
const GeneratedOTP=global.OTP;
const NUM=req.body.number;

//Integrating the generated otp and numbers in SMS api URL for sending the OTP through message on user`s mobile number  
const sms = unirest("POST", "https://www.fast2sms.com/dev/bulk");

sms.headers({
  "content-type": "application/x-www-form-urlencoded",
  "cache-control": "no-cache",
  "authorization":process.env.SMSKEY
});

sms.form({
  "sender_id": "SMSINI",
  "language": "english",
  "route": "qt",
  "numbers": NUM,
  "message": "42990",
  "variables": "{#AA#}",
  "variables_values":GeneratedOTP
});
sms.end(function (res) {
    if (res.error) throw new Error(res.error);
    console.log("otp send");
  });
//Creating jwt and sending it;
jwt.sign({id:number},process.env.SECRETKEY,{expiresIn:'600000'},(err,token)=>{
    if(err) throw err;
    res.json({token , login : false , register : true })
})
}else{
    res.json({msg :"Mobile Number already exist", login : false , register : false })
}

    }).catch(err=>{console.log(err)})
  
   
})
ROUTER.post('/validator',jwtValidator,(req,res)=>{
        const BODY=global.BODY;
        const NAME=BODY.name;
        const NUMBER=BODY.number;
        const PASSWORD=BODY.password;
        const GENERATEDOTP=global.OTP;
        
        bcrypt.genSalt(10,(err,salt)=>{
            if(err) throw err
            bcrypt.hash(PASSWORD,salt,(err,hash)=>{
                if(err) throw err
                encryptPass=hash
                if(req.body.otp===GENERATEDOTP){
                    const newConsumer=new Consumer({
                         name: NAME,
                         number:NUMBER,
                         password:encryptPass,
                         address:'',
                         appartment_or_building_name:'',
                         flat_or_house_number:'',
                         landmark:'',
                         road_name_or_number:'',
                         area:'',
                         colony:'',
                         state:'',
                         city:'',
                         pincode:'',
                         demo:true
                    });
                     newConsumer.save()
                     .then(consumer=>{//Creating jwt and sending it;
                        jwt.sign({id:consumer.id},process.env.SECRETKEY,{expiresIn:'72h'},(err,token)=>{
                            if(err) throw err;
                            res.json({token, consumer , login : true})
                        })
                         
                         
                     })
                }
                else{
                    res.json({msg : "INVALID OTP" , login : false , register : true})
                }
            })
        })
       
   })
    module.exports=ROUTER