import jwt from 'jsonwebtoken'

const authToken = async (req, res, next) => {
    try {
        const token = req.headers?.authorization?.replace("Bearer ", "").trim()

        if (!token) {
            return res.status(401).json({ success: false, message: "Please login first" })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decodedToken.userId
        next()

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        })
    }
}

export default authToken