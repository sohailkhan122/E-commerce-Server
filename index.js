const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors')
const { default: mongoose } = require('mongoose');
const userRoutes = require('./Routes/userRoutes')
const productRoute = require('./Routes/productRoute')
const cartRoute = require('./Routes/cartRoute')
const orderRoute = require('./Routes/orderRoute')
const adminRoutes = require('./Routes/adminRoute')
const whislistRoute = require('./Routes/whislistRoute')


const app = express();
dotenv.config();
app.use(express.json());
app.use(cors())

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
    res.send("api running")
});

app.use('/admin', adminRoutes)
app.use('/user', userRoutes)
app.use('/product', productRoute)
app.use('/cart', cartRoute)
app.use('/order', orderRoute)
app.use('/wishlist', whislistRoute)


const PORT = process.env.PORT || 5000

app.listen(PORT, console.log("Server Is Running..."))