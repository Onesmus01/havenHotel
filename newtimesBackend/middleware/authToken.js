import jwt from 'jsonwebtoken'
const authToken = async(req,res,next)=> {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ","").trim()

        if(!token){
            return res.status(400).json({success: false,message: "Please Login....."})
        }

        const decodedToken =  jwt.verify(token,process.env.JWT_SECRET)

        if(!decodedToken){
             return res.status(400).json({success: false,message: "Token is missing,unauthorized"})
        }

        req.userId =  decodedToken?._id
        next()

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message,
     });
    }

}
export default authToken