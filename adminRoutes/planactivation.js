const EXPRESS=require('express');
const ROUTER=EXPRESS.Router();
const jwtValidator=require('../middleware/jwtValidator')
const activationAndvalidity=require('../middleware/activationAndvalidity')
const Admin=require('../dbmodels/admindbmodel')
const Consumer=require('../dbmodels/customerdbmodel')


ROUTER.post('/',jwtValidator,activationAndvalidity,(req,res)=>{
    const id=req.user.id;
    const ACTIVATIONDATE=req.bawa.ACTIVATIONdate
    const VALIDITYDATE=req.bawa.VALIDITYdate
    const number=req.body.number
    Admin.findById(id)
    .then(admin=>{
        if(admin){
            Consumer.findOneAndUpdate({number},
                {isActivated:true,isSubscribed:true,
                    activationDate:ACTIVATIONDATE,
                     validityDate:VALIDITYDATE
                },{returnOriginal:false}).then(Res=>{res.json(Res)}).catch(Err=>{res.json(Err)})

        }
        else{
            res.json({msg:"You are not authorized to perform this task"})
        }
    })

})
module.exports=ROUTER