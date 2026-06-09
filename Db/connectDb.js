import dotenv from "dotenv"
import mongoose from "mongoose"
dotenv.config()
const connectDb = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('db connected')
    }
    catch(error){
        console.log(error);
        
    }
}
export default connectDb