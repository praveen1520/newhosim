import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import ConnectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminroute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoutes.js'
const app=express()
const port=process.env.PORT || 4000
ConnectDB()
connectCloudinary()

app.use(express.json())
app.use(cors())
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.get('/',(req,res)=>{
    res.send('API WORKING')
})

app.listen(port,()=>console.log("server started",port))