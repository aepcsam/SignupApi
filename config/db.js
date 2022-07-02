const mongoose = require('mongoose');

const url =process.env.MONGODB_URL;

const connectDb = async(req,res)=>{
    try {
        const con = await mongoose.connect(url);
        console.log(`MongoDb Connected : ${con.connection.host}`);
    } catch (error) {
        res.json({msg:error.message});
    }
}


module.exports = connectDb;