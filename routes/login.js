const EXPRESS=require('express');
const ROUTER=EXPRESS.Router();
const Consumer=require('../dbmodels/customerdbmodel');
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')
require('dotenv').config()

ROUTER.post('/',(req,res)=>{
    const {number,password}=req.body;
    Consumer.findOne({number}).then(consumer=>{
if(!consumer){
    res.json({msg :"NUMBER NOT REGISTERED", login : false })
}
else{
    bcrypt.compare(password,consumer.password)
    .then(isMatch=>{
        if(!isMatch){
            res.json({msg :"INVALID PASSWORD", login : false })
        }else{
            jwt.sign({id:consumer.id},process.env.SECRETKEY,{expiresIn:'72h'},(err,token)=>{
                     if(err) throw err;
                      res.json({token,consumer,login : true})})
        }
    })
    
    
}

    }).catch(err=>{res.json(err)})



})

module.exports=ROUTER;