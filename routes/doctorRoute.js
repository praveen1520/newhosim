import express from 'express'
import {appointmentCancel, appointmentComplete, appointmentsDoctor, doctordashboard, doctorList, doctorProfile, loginDoctor, updateDoctorprofile} from '../controller/doctorController.js'
import authDoctor from '../middleware/authDoctor.js'
const doctorRouter=express.Router()

doctorRouter.get('/list',doctorList)
doctorRouter.post("/login",loginDoctor)
doctorRouter.get("/appointments",authDoctor,appointmentsDoctor)
doctorRouter.post("/complete-appointment",authDoctor,appointmentComplete)
doctorRouter.post("/cancel-appointment",authDoctor,appointmentCancel)
doctorRouter.get("/dashboard",authDoctor,doctordashboard)
doctorRouter.post("/update-profile",authDoctor,updateDoctorprofile)
doctorRouter.get("/profile",authDoctor,doctorProfile)

export default doctorRouter