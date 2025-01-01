// api for adding doctor
import validator from "validator"
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import appointModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"

const adddoctor=async (req,res)=>{
    try{
        const {name,email,password,speciality,degree,experience,about,fees,address}=req.body
        const imageFile=req.file
        // checking for the data to add to doctor
        if(!name||!email||!password||!speciality||!degree||!experience||!about||!fees||!address){
            return res.json({success:false,message:"missing details"})
        }
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please Enter a Valid email"})
        }
        if(password.length<8){
            return res.json({success:false,message:"Please Enter a Strong Password"})
        }
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)
        const imageupload=await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
        const imageUrl=imageupload.secure_url
        const doctorData={
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now()
        }
        const newDoctor=new doctorModel(doctorData)
        await newDoctor.save()
        res.json({success:true,Message:"Doctor added successFully"})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API for admin login

const loginAdmin=async(req,res)=>{
    try{
            const {email,password}=req.body 
            if (email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
                const token=jwt.sign(email+password,process.env.JWT_SECRET)
                res.json({success:true,token})

            }else{
                res.json({success:false,message:"Invalid credentails"})
            }

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
    
}

//API TO GET ALL DOCTORS LIST

const allDoctors=async (req,res)=>{
    try{
        const doctors=await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const appointmentsAdmin=async (req,res)=>{
    try{
        const appointments=await appointModel.find({})
        res.json({success:true,appointments})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const appointmentCancel=async (req,res)=>{
    try {
       const {appointmentId}=req.body 
       const appointmentData=await appointModel.findById(appointmentId)
    
       await appointModel.findByIdAndUpdate(appointmentId,{cancelled:true})
       const {docId,slotDate,slotTime}=appointmentData
       const doctorData=await doctorModel.findById(docId)
       let slots_booked=doctorData.slots_booked
       slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)
       await doctorModel.findByIdAndUpdate(docId,{slots_booked})
       res.json({success:true,message:'Appointment Cancelled'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    
    }
}

// api to get dashboard data

const admindashboard=async (req,res)=>{
    try {
        const doctors=await doctorModel.find({})
        const users=await userModel.find({})
        const appointments=await appointModel.find({})
        const dashData={
            doctors:doctors.length,
            appointments:appointments.length,
            patients:users.length,
            lateshAppointments:appointments.reverse().slice(0,5)
        }
        res.json({success:true,dashData})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}
export {adddoctor,loginAdmin,allDoctors,appointmentsAdmin,appointmentCancel,admindashboard}