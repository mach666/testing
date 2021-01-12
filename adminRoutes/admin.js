const EXPRESS=require('express')
const ROUTER=EXPRESS.Router()
const Admin=require('../dbmodels/admindbmodel')
const jwtValidator=require('../middleware/jwtValidator')
const jwt=require('jsonwebtoken')
const otpGenerator=require('otp-generator')
const unirest=require('unirest')
const bcrypt=require('bcryptjs')
require('dotenv').config()


ROUTER.post('/login',(req,res)=>{
    const {number}=req.body
    Admin.findOne({number}).then(admin=>{
if(admin){
    
global.OTP1=otpGenerator.generate(5,{upperCase:false,specialChars:false,alphabets:false,digits:true});
global.BODY=req.body;
const GeneratedOTP=global.OTP1;
const NUM=req.body.number;

//Integrating the generated otp and numbers in SMS api URL for sending the OTP through message on user`s mobile number  
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
  "variables_values":GeneratedOTP
});
sms.end(function (res) {
    if (res.error) throw new Error(res.error);
    console.log("OTP IS SEND");
  });
//Creating jwt and sending it;
jwt.sign({id:number},process.env.SECRETKEY,{expiresIn:'600000'},(err,token)=>{
    if(err) throw err;
    res.json({token , num : true})
})
}else{
    res.json({msg:"You are not ragistered with this number as a admin with THE BLOOMAA" , num :false})
}

    }).catch(err=>{console.log(err)})
  
})
ROUTER.post('/loginotpvalidator',jwtValidator,(req,res)=>{
    const GENERATEDOTP=global.OTP1
    const otp=req.body.otp
    const number=req.user.id
    if(GENERATEDOTP===otp){
        Admin.findOne({number})
        .then(admin=>{
            
            
          if(admin){
             const number=admin.number
              jwt.sign({id:number},process.env.SECRETKEY,{expiresIn:'600000'},(err,token)=>{
                if(err) throw err;
                res.json({token , "otp" : true})
            })

          }
          else{
              res.json({msg:"something miscellaneous has happend" })
          }



        }).catch(Err=>{res.json(Err)})}
    else{
        res.json({msg:"PLEASE ENTER A VALID OTP",  "otp" : false})
    }
})
ROUTER.post('/entername',jwtValidator,(req,res)=>{
        const nameInReq=req.body.name;
        const number=req.user.id;
        Admin.findOne({number})
        .then(admin=>{
            const validName=admin.name
            
            if(validName===nameInReq){
                jwt.sign({id:number},process.env.SECRETKEY,{expiresIn:'600000'},(err,token)=>{
                    if(err) throw err;
                    res.json({token , "name" : true })
                })
            }
            else{
                res.json({msg:"You are not ragistered as an admin with this name with THE BLOOMA"  , "name" : false})
            }
        })
        .catch(Err=>{ res.json({msg:'SOMETHING MISCELLANEOUS HAS HAPPEND' })})
       
       
})
ROUTER.post('/enteremail',jwtValidator,(req,res)=>{
    const emailInReq=req.body.email;
    const number=req.user.id;
    Admin.findOne({number})
    .then(admin=>{
        const validEmail=admin.email;
        if(validEmail===emailInReq){
            jwt.sign({id:number},process.env.SECRETKEY,{expiresIn:'600000'},(err,token)=>{
                if(err) throw err;
                res.json({token , "email" : true})
            })
        }
        else{
            res.json({msg:"YOU ARE NOT RAGISTERED WITH THIS EMAIL WITH THE BLOOMAA" , "email" : false})
        }
    })
    .catch(Err=>{
        res.json({msg:'somethihng miscellaneous has happend'})
    })
   

})
ROUTER.post('/gettingpassword',jwtValidator,(req,res)=>{
    const passInReq=req.body.password;
    const number=req.user.id;
    Admin.findOne({number})
    .then(admin=>{
        if(admin){
            bcrypt.compare(passInReq,admin.password)
            .then(isMatch=>{
                if(!isMatch){
                    res.json({msg:'please enter a valid password', "pass":false })
                }
                else{
                    const idForjwt=admin.id
                    jwt.sign({id:idForjwt},process.env.SECRETKEY,{expiresIn:'12h'},(err,token)=>{
                        if(err) throw err;
                        res.json({token ,"pass":true , "adminLogin" : true}) })
                }
            })
           
        }
        else {
            res.json({msg:'SOMETHIGNG MISCELLANEOUS HAS HAPPEND'})
        }
    })
         
})



module.exports=ROUTER