const express= require('express');
const mongoose= require('mongoose');
const app= express();
app.use(express.urlencoded({extended:true}))
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/register.html')
});

mongoose.connect('mongodb://localhost:27017/registerationform')
.then(()=>{console.log("connected to mongodb")
})
.catch((err) => {
    console.log("error in connecting ", err);
});
const userSchema = new mongoose.Schema({
    fullname:String ,
    email:String,
    password:String,
    confirmPassword:String,
   

});
const user = mongoose.model('user', userSchema)
app.post('/register', (req,res)=>{
    const{fullname,  email, password, confirmPassword }= req.body;
    const myuser= user({
        fullname, 
         email,
         password,
         confirmPassword
        
    });
    myuser.save()
    .then(()=>res.send('<h1>registration succesfully</h1>'))
    .catch(err => res.status(500).send('error registration user'+ err.message))
})

app.listen(9001, ()=>{
    console.log('server running at http//localhost:9001')
})