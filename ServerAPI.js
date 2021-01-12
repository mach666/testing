const EXPRESS=require('express');
const APP=EXPRESS();
const MONGOOSE=require('mongoose')
const path=require('path')
const cors=require('cors')
const port=process.env.PORT || 5000
require('dotenv').config()
APP.use(cors())
APP.use(EXPRESS.json())
APP.use('/ragister',require('./routes/ragister.js'));
APP.use('/validator',require('./routes/ragister.js'))
APP.use('/login',require('./routes/login.js'));
APP.use('/passrcvry',require('./routes/passrcvry'))
APP.use('/passrcvryValidator',require('./routes/passrcvry'))
APP.use('/dlvryaddrssupdation',require('./routes/dlvryaddrssupdation'))
APP.use('/orders',require('./routes/orders'))
APP.use('/pymntverifyandupdation',require('./routes/pymntverifyandupdation'))
APP.use('/nmbrupdation',require('./routes/nmbrupdation'))
APP.use('/admin',require('./adminRoutes/admin.js'))
APP.use('/newAdmin',require('./adminRoutes/newAdmin.js'))
APP.use('/adminAccess',require('./adminRoutes/adminAccess.js'))
APP.use('/fndcnsumrbysbscrptiondate',require('./adminRoutes/fndcnsumrbysbscrptiondate.js'))
APP.use('/planactivation',require('./adminRoutes/planactivation.js'))
APP.use('/gettingUserSession',require('./routes/gettingUserSession'))
APP.use('/fndexpiredplans',require('./adminRoutes/fndexpiredplans'))
APP.use('/plandeactivation',require('./adminRoutes/plandeactivation'))
APP.use('/fndconsumerbynumber',require('./adminRoutes/fndconsumerbynumber'))
MONGOOSE.connect(process.env.DBKEY,{ useNewUrlParser: true,
useUnifiedTopology: true,
useFindAndModify: false,
useCreateIndex: true})
.then(res=>{console.log("DATABASE IS CONNECTED")})
.catch(err=>{console.log(err)})

APP.use(EXPRESS.static(path.join(__dirname,'build')))
APP.get('/*',(req,res)=>{
    res.sendFile(path.join(__dirname,'build','index.html'))
    
})
APP.listen(port);