import mongoose from "mongoose";
import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import appointModel from "../models/appointmentModel.js";

const loginDoctor=async (req,res)=>{
  try {
    const {email,password}=req.body
    const doctor=await doctorModel.findOne({email})
    if(!doctor){
       return res.json({ success: false, message: "Invalid Creditinals" });
    }
    const ismatch=await bcrypt.compare(password,doctor.password)
    if(ismatch){
      const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET)
      res.json({success:true,token})
    }else{
       res.json({success:false,message:"Invalid credentails"})
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}
const changeAvaliabilty = async (req, res) => {
  try {
    const { docId } = req.body;

    // Validate docId
    if (!mongoose.Types.ObjectId.isValid(docId)) {
      return res.status(400).json({ success: false, message: "Invalid Doctor ID format" });
    }

    // Fetch the document
    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Check if the `avaliable` field exists
    if (typeof docData.avaliable === "undefined") {
      return res.status(500).json({ success: false, message: "Availability field is missing in the database" });
    }

    // Toggle availability
    docData.avaliable = !docData.avaliable;
    await docData.save();

    res.json({ success: true, message: "Availability changed", data: docData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const doctorList=async (req,res)=>{
  try {
    const doctors=await doctorModel.find({}).select(['-password','-email'])
    res.json({success:true,doctors})
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const appointmentsDoctor=async (req,res)=>{
  try {
    const {docId}=req.body
    const appointments=await appointModel.find({docId})
    res.json({success:true,appointments})
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}
//apointment completed

const appointmentComplete=async (req,res)=>{
  try {
    const {docId,appointmentId}=req.body
    const appointmentData=await appointModel.findById(appointmentId)
    if(appointmentData && appointmentData.docId===docId){
      await appointModel.findByIdAndUpdate(appointmentId,{isCompleted:true})
      return res.json({success:true,message:"Appointment Completed"})
    }else{
      return res.json({success:false,message:"mark failed"})
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const appointmentCancel=async (req,res)=>{
  try {
    const {docId,appointmentId}=req.body
    const appointmentData=await appointModel.findById(appointmentId)
    if(appointmentData && appointmentData.docId===docId){
      await appointModel.findByIdAndUpdate(appointmentId,{cancelled:true})
      return res.json({success:true,message:"Appointment Cancelled"})
    }else{
      return res.json({success:false,message:"Cancelleation Failed"})
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const doctordashboard=async(req,res)=>{
  try {
    const {docId}=req.body
    const appointments=await appointModel.find({docId})
    let patients=[]
    appointments.map((item)=>{
        if (!patients.includes(item.userId)){
        patients.push(item.userId)
      }
    })
    const dashData={
      appointments:appointments.length,
      patients:patients.length,
      latestAppointments:appointments.reverse().slice(0,5)
    }
    res.json({success:true,dashData})
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const doctorProfile=async (req,res)=>{
  try {
    const {docId}=req.body
    const profileData=await doctorModel.findById(docId).select("-password")
    res.json({success:true,profileData})
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}
const updateDoctorprofile=async (req,res)=>{
  try {
    const {docId,fees,address,avaliable}=req.body
    await doctorModel.findByIdAndUpdate(docId,{fees,address,avaliable})
    res.json({success:true,message:"profile Updated"})
    
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}

export { changeAvaliabilty ,doctorList,loginDoctor,appointmentsDoctor,appointmentCancel,appointmentComplete,doctordashboard,doctorProfile,updateDoctorprofile};
