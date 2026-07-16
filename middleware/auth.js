const jwt=require('jsonwebtoken');
const protect=(req,res,next)=>{
    try{
        const token=req.headers['authorization'];

        if(!token){
            return res.json({
                success:false,
                message:"No token! Please login first."
            });
        }
        const decode=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decode;
        next();
    }catch(error){
        res.json({
            success:false,
            message:"Invalid token! Please login again."
        });
    }
};
module.exports=protect;