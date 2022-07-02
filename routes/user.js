const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// console.log(jwt)
router.get('/',(req,res)=>{
    res.json('user Router is working');
    
});

router.post('/signup',async(req,res)=>{
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password,salt);
        const user = new User({
            userName:req.body.userName,
            email:req.body.email,
            password:password,
        });
        const result = await user.save();
        res.json(user);
        const jwtToken = jwt.sign({_id:result._id},salt);
        console.log(`JwtToken : ${jwtToken}`);

        // NodeMailer Setting
        let transporter = nodemailer.createTransport({
            host:process.env.SMTP_HOST,
            port:587,
            secure:false,
            auth:{
                user:process.env.SMTP_MAIL,
                pass:process.env.SMTP_PASSWORD
            }, 
        });


    transporter.verify((error,success)=>{
        if(error){
            res.json({msg:error.message});
        }
        else{
            console.log('Server is ready to Take Our Message');
        }
    })
   
    // Verify Email Send ...

    let info = await transporter.sendMail({
        from:process.env.SMTP_MAIL,
        to:req.body.email,
        subject:"Verify your Email - New Dev Team",
        // text:"Hello Signup Verified",
        html:`
        <div>
            Hi <b>${req.body.name}</b>, 
                <h2>Welcome To Our New Platform</h2>
                <hr />
                <div style="background-color:blue;color:white;text=align:center;">
                    <a href="http://localhost:4000/user/verify/${jwtToken}">Verified your Email</a>
                </div>
                <hr />
                <div>
                    <p>Thanks and Regards</p>
                    <p>From Mail Team</p>
                </div>
            
        </div>`
    });
    
    if(info){
        console.log(info);
    }
    res.json(result);
});


router.post('/login',async(req,res)=>{
        try {
            const user = await User.findOne({email:req.body.email});
            if(user){
                const result = await bcrypt.compare(req.body.password,user.password);
                if(result){
                    const token = jwt.sign({id:user._id},`${process.env.KEY_WORD}`);
                    return res.json(token);
                }else{
                    return res.json("Wrong Password");
                }
            }else{
                return res.json({msg:"No user Not Found"});
            }
        } catch (error) {
            return res.json({msg:error.message});
        }
    });
    
    const verifyToken = (req,res,next)=>{
        const token = req.headers['authorization'];
        if(token){
            jwt.verify(token,`${process.env.KEY_WORD}`,(err,decoded)=>{
                if(err){
                    return res.json({msg:"Access Denied"});
                }
                else{
                    req.userId = decoded.id;
                    next();
                }
            });
        } else{
            res.json({msg:"Access Denid"});
        }
    };
    
    
    router.get('/data',verifyToken,async(req,res)=>{
        try {
            const userId = req.userId;
            const user = await User.findById({_id:userId});
            res.json(user);
        } catch (error) {
            console.log(error);
            res.json({msg:error.message});
        }
    });
    
    router.get('/verify/:token',async(req,res)=>{
        try {
            const token = req.params.token;
            jwt.verify(token,`${process.env.KEY_WORD}`,async(err,decoded)=>{
                if(err){
                    return;
                }
                else{
                    const user = await User.findByIdAndUpdate(
                        {_id:decoded.id},
                        {verified:true},
                        {new : true},
                    );
                    res.json(user);
                }
            });
    
        } catch (error) {
            console.log(error)
        }
    })
    

module.exports = router;