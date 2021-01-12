const EXPRESS = require('express');
const ROUTER = EXPRESS.Router();
const jwtValidator = require('../middleware/jwtValidator');
const Consumer = require('../dbmodels/customerdbmodel')
const jwt=require('jsonwebtoken')
require('dotenv').config()

ROUTER.post('/',jwtValidator,(req,res)=>{
    const id= req.user.id;
    Consumer.findById(id)
    .then(consumer=>{
        const id1=consumer.id
        jwt.sign({id:id1},process.env.SECRETKEY,{expiresIn:'72h'},(err,token)=>{
            if(err) throw err;
            res.json({token,consumer,login : true})
        })
    }).catch(err=>console.log(err))
})

module.exports=ROUTER