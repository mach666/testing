const EXPRESS=require('express')
const ROUTER=EXPRESS.Router()
const jwtValidator=require('../middleware/jwtValidator')
const Admin=require('../dbmodels/admindbmodel')
const Consumer=require('../dbmodels/customerdbmodel')




ROUTER.post('/',jwtValidator,(req,res)=>{
   const DATE=req.body.date
    const id=req.user.id;
    Admin.findById(id)
    .then(admin=>{
        if(admin){
             Consumer.find({'validityDate':DATE})
             .then(consumer=>{
                 if(consumer){
                     res.json(consumer)
                 }else{
                     res.json({msg:"No consumer found at this date"})
                 }
             }).catch(Err=>{console.log(Err)})
        }else{
            res.json({msg:"You are not a authorized ADMIN, just go and fuck off!,YOU CANT BREAK IT"})
        }
    }).catch(Err=>{
        console.log(Err)
    })
})
module.exports=ROUTER