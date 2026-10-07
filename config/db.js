import mongoose from "mongoose";
import dotenv from "dotenv";
//coneccion a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      dbName: process.env.DBNAME });
    console.log(`MongoDB Connected: ${mongoose.connection.host
      
    }`);
   
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }    
};

export {connectDB};

