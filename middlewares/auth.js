import express from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
const app = express()
dotenv.config();
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization
        if (!token) {
            return res.json({
                msg: "token is missing"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next()
    }catch(error){
        console.log(error);
        
    }
    
}
export default auth