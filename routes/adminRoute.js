import express from 'express'
import { adddoctor,admindashboard,allDoctors,appointmentCancel,appointmentsAdmin,loginAdmin } from '../controller/adminController.js'
import upload from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js'
import { changeAvaliabilty } from '../controller/doctorController.js'

const adminRouter=express.Router()
adminRouter.post('/add-doctor',authAdmin,upload.single('image'),adddoctor)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors',authAdmin,allDoctors)
adminRouter.post('/change-availability',authAdmin,changeAvaliabilty)
adminRouter.get('/appointments',authAdmin,appointmentsAdmin)
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel)
adminRouter.get('/dashboard',authAdmin,admindashboard)
export default adminRouter