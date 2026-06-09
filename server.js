import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import connectDb from "./Db/connectDb.js"
import usermodel from "./model/Userschema.js"
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken"
import auth from "./middlewares/auth.js"
import razorpay from "./config/razorpay.js"
import crypto from 'crypto'
const app = express()
app.use(express.json())
app.use(
  cors({
    origin: [
      "https://vendr-shopping-website.vercel.app"
    ],
    credentials: true,
  })
);
dotenv.config()
console.log(process.env.MONGO_URI);
connectDb();
app.get('/', (req, res) => {
    res.json({
        msg: "Home Page"
    })
})
app.get('/profile', auth, async (req, res) => {
    try {
        const User = await usermodel.findById(req.user.id);
        res.json({
            cart:User.cartitems,
            User
        })
        
    } catch (error) {
        console.log(error);

    }
})
app.post('/auth/signup', async (req, res) => {
    const { username, email, password } = req.body
    console.log(username, email, password)
    const hash = await bcrypt.hash(password, 10);
    try {
        const User = new usermodel({
            username: username,
            email: email,
            password: hash
        })
        await User.save()
        res.json({
            msg: "user created"
        })
        console.log('user saved');


    } catch (error) {
        console.log(error);

    }
})
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const User = await usermodel.findOne({ email })
        if (!User) {
            return res.json({
                msg: "user doesn't exist"
            })
        }
        const match = await bcrypt.compare(password, User.password);
        if (match) {
            const token = jwt.sign({ id: User._id, email: User.email }, process.env.JWT_SECRET, { expiresIn: "7d" })
            return res.json({
                msg: "login success",
                User,
                token
            });

        }

        return res.json({
            msg: "incorrect password"
        });
    } catch (error) {
        console.log(error);

    }
})
app.post('/fetchcart', auth, async (req, res) => {
    console.log("fetch hit");
    try {
        const { cart } = req.body;
        await usermodel.findByIdAndUpdate(
            req.user.id,
            {
                cartitems: cart
            }
        );
        res.json({
            message: "cart updated"
        })
    }catch(error){
        console.log(error);
        
    }
    
})
app.post('/create-order', async (req, res) => {
    const { amount } = req.body;
    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: "receipt_" + Date.now(),
    }
    try {
        const order = await razorpay.orders.create(options);
        res.json(order)
    }
    catch (error) {
        res.json({
            error: error.message
        })
    }
})
app.post('/verify', async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;
    console.log(razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature);

    const gensignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id +
        "|" +
        razorpay_payment_id).digest('hex')
    console.log("Generated:", gensignature);
    console.log("Received :", razorpay_signature);
    if (gensignature === razorpay_signature) {
        return res.json({
            success: true
        });
    }
    res.status(400).json({
        success: false
    });

})

app.listen(5000, () => {
    console.log('server started');

})