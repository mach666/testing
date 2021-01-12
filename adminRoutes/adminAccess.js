const EXPRESS=require('express');
const ROUTER=EXPRESS.Router();
const jwtValidator=require('../middleware/jwtValidator');
const Admin=require('../dbmodels/admindbmodel');
const otpgenerator=require('otp-generator');
const unirest=require('unirest');
const jwt=require('jsonwebtoken');
require('dotenv').config()
ROUTER.post('/access',jwtValidator,(req,res)=>{
    const _id=req.user.id;
    Admin.findById(_id)
    .then(admin=>{
        if(admin){
            const number=admin.number;
            global.OTP3=otpgenerator.generate(5,{upperCase:false,specialChars:false,alphabets:false,digits:true});
            const GeneratedOTP3=global.OTP3;
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
              "variables_values":GeneratedOTP3
            });
            sms.end(function (res) {
                if (res.error) throw new Error(res.error);
                console.log("OTP IS SEND");
              });

            jwt.sign({id:_id},process.env.SECRETKEY,{expiresIn:'600000'},(err,token)=>{
                if(err) throw err;
                res.json({token , "accessotp" : true})
            })
        }
        else{
            res.json({msg:"You are not a authorized ADMIN, just go and fuck off!,YOU CANT BREAK IT" , "accessotp" : false})
        }
    })

})
ROUTER.post('/accessotpvalidator',jwtValidator,(req,res)=>{
       const reqotp=req.body.otp;
       const validotp=global.OTP3;
       const _id1=req.user.id;
       Admin.findById(_id1)
       .then(admin=>{
           const number=admin.number
           if(admin){
               if(validotp===reqotp){
                jwt.sign({id:number},process.env.SECRETKEY,{expiresIn:'600000'},(err,token)=>{
                    if(err) throw err;
                    res.json({token , "accessotp" : true})
                })
            }else{
                res.json({msg:"Please Enter a Valid OTP" , "accessotp" : false})
            }
               }else{
                   res.json({msg:"You are not a authorized ADMIN, just go and fuck off!,YOU CANT BREAK IT", })
               }
           
       }).catch(err=>{
           res.json({msg:"SOMETHING MISCELLANEOUS HAS HAPPEND"})
       })
})
ROUTER.post('/adminActualAccess',jwtValidator,(req,res)=>{
    const number=req.user.id;
    console.log(number)
    Admin.findOne({number})
    .then(admin=>{
    
        if(admin){
            const id2=admin.id;
            jwt.sign({id:id2},process.env.SECRETKEY,{expiresIn:'12h'},(err,token)=>{
                if(err) throw err;
                res.json({token,msg:"NOW YOU ARE AUTHORIZED TO ACCESS THE CONSUMER DATABASE! PRESS ACCESS BUTTON TO PROCEED" , "finallogin" : true})
            })
        }else{
            res.json({msg:"You are not a authorized ADMIN, just go and fuck off!,YOU CANT BREAK IT" , "finallogin" : false})
        }
        
    })
    .catch(err=>{
        res.json({msg:"SOMETHING MISCELANIOUS HAS HAPPEND"})
    })

})
module.exports=ROUTER