import express from "express"

import {getProfile, loginUser, registerUser, updateProfile,bookAppointment, listAppointments, cancelAppointment} from '../controller/userController.js'
import authUser from "../middleware/authUser.js"
import upload from "../middleware/multer.js"
import { appointmentComplete } from "../controller/doctorController.js"

const userRouter=express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get("/get-profile",authUser,getProfile)
userRouter.post("/update-profile",upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments',authUser,listAppointments)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/complete-appointment',authUser,appointmentComplete)
export default userRouter