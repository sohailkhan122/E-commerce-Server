const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors')
const { default: mongoose } = require('mongoose');
const userRoutes = require('./Routes/userRoutes')
const productRoute = require('./Routes/productRoute')
const paymentRoute = require('./Routes/paymentRoute')
const cartRoute = require('./Routes/cartRoute')
const orderRoute = require('./Routes/orderRoute')
const whislistRoute = require('./Routes/whislistRoute');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: false,
    })
);

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URL);
        console.log("Server Is Connected To Database");
    } catch (error) {
        console.log("Server Is Not Connected To Database", error.message);
    }
}
connectDb()
app.get("/", (req, res) => {
    res.cookie("testCookie", "Hello World", { httpOnly: true, secure: true, sameSite: "strict" });
    res.send("api running")
});

app.use('/user', userRoutes)
app.use('/product', productRoute)
app.use('/cart', cartRoute)
app.use('/order', orderRoute)
app.use('/wishlist', whislistRoute)
app.use('/payment', paymentRoute)


const PORT = process.env.PORT || 5000

app.listen(PORT, console.log("Server Is Running..."))