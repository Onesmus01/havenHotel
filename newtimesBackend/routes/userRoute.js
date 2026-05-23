import express from 'express'
import {signIn,signUp,userDetails,logout,updateUser,getAllUsers, getAdminStats } from '../controller/userController.js'
import authToken from '../middleware/authToken.js'
const userRouter = express.Router()

userRouter.post('/signin',signIn)
userRouter.post('/signup',signUp)
userRouter.get('/user-details',authToken,userDetails)
userRouter.post('/logout',logout)
userRouter.get('/all-users',authToken,getAllUsers)
userRouter.put('/update-user',authToken,updateUser)
userRouter.get("/analytics",authToken, getAdminStats);


export default userRouter