const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        require:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match:/.+\@.+\..+/ 
    },
    password:{
        type:String,
        required:true,
    },
    verified:
        {   type:Boolean,
            default:false
        }
});

const User = new mongoose.model('users',userSchema);
module.exports = User;