const express= require('express');
const mongoose= require('mongoose');
const app= express();
app.use(express.urlencoded({extended:true}))

app.get('/', (req,res)=>{
    res.sendFile(__dirname  +'/login.html')
})

mongoose.connect('mongodb://localhost:27017/registerationform')
.then(()=>{console.log("connected to mongodb")
})
.catch(()=>{console.log("not connected")
});
const userSchema = new mongoose.Schema({
    email:String,
    password:String,
   
});
const user = mongoose.model('user', userSchema)
//for login
app.post('/login', async (req, res)=>{
    const{ email, password}= req.body
    try{
        const user = await user.findOne({ email, password});
        if(user){
            res.send(`<h1>welcome back, ${user.fullname} </h1>`)
        } else{
            res.status(401).send('<h1>invalid email or password</h1>')
        }
    }catch(err){
        res.status(500).send('error login in:'+ err.message)
    }
});

app.listen(8080, ()=>{
    console.log('server running at http//localhost:8080')
})