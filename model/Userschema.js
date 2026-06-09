import mongoose from "mongoose";
const Userschema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String
    },
    cartitems:{
        type:[]
    }
},{timestamps:true})
const usermodel = mongoose.model("userdata",Userschema);
export default usermodel