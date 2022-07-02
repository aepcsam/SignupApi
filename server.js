const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
const connectDb = require('./config/db');
const userRouter = require('./routes/user');
const User = require('./models/user');
const PORT = process.env.PORT || 4000
connectDb();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/user',userRouter);

app.get('/',(req,res)=>{
    res.json({msg:"Api is Working"});
})

app.listen(PORT,()=>{
    console.log(`Server is Running at ${PORT}`);
});