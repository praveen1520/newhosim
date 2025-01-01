//api To resigester
import validator from "validator"
import bcrypt from "bcrypt"
import userModel from "../models/userModel.js"
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js"
import appointmentModel from '../models/appointmentModel.js'
import appointModel from "../models/appointmentModel.js"

const registerUser=async (req,res)=>{
    try {
        const {name,email,password}=req.body
        if(!name||!email||!password){
            return res.json({success:false,message:'Missing details'})
        }
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Enter  a  Valid Email"})
        }
        if(password.length<8){
            return res.json({success:false,message:"Enter a strong Password"})
        }
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)
        const userData={
            name,
            email,
            password: hashedPassword
        }
        const newUser=new userModel(userData)
        const user=newUser.save()

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.json({success:true,token})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}
const loginUser=async (req,res)=>{
    try {
        const {email,password}=req.body
        const user=await userModel.findOne({email})
        if(!user){
            return res.json({success:false,message:"User does not exist"})
        }
        const ismatch=await bcrypt.compare(password,user.password)
        if(ismatch){
            const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true,token})
        }else{
            res.json({success:false,message:"Invalid credientials"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}
const getProfile=async (req,res)=>{
    try {
        const {userId}=req.body
        const userData=await userModel.findById(userId).select('-password')
        res.json({success:true,userData})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}
const updateProfile=async (req,res)=>{
    try {
        const {userId,name,phone,address,dob,gender}=req.body
        const imageFile=req.file
        if(!name||!phone||!dob||!gender){
            return res.json({success:false,message:"Data missing"})
        }
        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})
        if(imageFile){
            const imageUpload=await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
            const imageURL=imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }
        res.json({success:true,message:"Profile Updated"})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


const bookAppointment=async ( req,res)=>{
    try {
        const {userId,docId,slotDate,slotTime}=req.body
        const docData=await doctorModel.findById(docId).select("-password")
        if(!docData.avaliable){
             return res.json({success:false,message:"Doctor Not avaliable"})
        }
        let slots_booked=docData.slots_booked

        if (slots_booked[slotDate]){
            if (slots_booked[slotDate].includes(slotTime)){
                  return res.json({success:false,message:"Slot Not avaliable"})
            }
            else{
                slots_booked[slotDate].push(slotTime)
            }

        }
        else{
            slots_booked[slotDate]=[]
            slots_booked[slotDate].push(slotTime)
        }

        const userData=await userModel.findById(userId).select('-password')
        delete docData.slots_booked

        const appointmentData={
            userId,docId,userData,docData,amount:docData.fees, slotTime,slotDate,date:Date.now()
        }

        const newAppointment=new appointmentModel(appointmentData)
        await newAppointment.save()

        //save new slots data in docData 
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:'Appointment Booked'})
    } 
    
    catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const listAppointments=async(req,res)=>{
    try{
        const {userId}=req.body 
        const appointments=await appointmentModel.find({userId})
        res.json({success:true,appointments})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const cancelAppointment=async (req,res)=>{
    try {
       const {userId,appointmentId}=req.body 
       const appointmentData=await appointModel.findById(appointmentId)
       if(appointmentData.userId!==userId){
        return res.json({success:false,message:"unauthorized Action"})

       }
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



export {registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointments,cancelAppointment}