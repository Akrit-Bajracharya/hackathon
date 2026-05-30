import mongoose from "mongoose";

const connectDB = async () => {
    try {
      await  mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected succesfully");
        
    } catch (error) {
        console.error("Something went wrong in database connection",error.message);
        console.log("Database connection failed");

    }
}
export {
    connectDB
}
