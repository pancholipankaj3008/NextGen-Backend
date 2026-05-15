let dotenv = require("dotenv");
dotenv.config();

let express = require('express');
let cors = require('cors');
var cookieParser = require('cookie-parser')
const ConnectDB = require("./Config/dbConfig");

const UserRouter = require("./Routes/UserRoutes");
const ProductRouter = require("./Routes/ProductRoutes");
const CartRouter = require("./Routes/CartRoutes");
const ReviewRouter = require("./Routes/ReviewRoutes");
const NewsletterRouter = require("./Routes/NewsletterRoutes");


let app = express();
let Port = process.env.PORT;

app.use(express.json());

app.use(cors({
    origin:"*",
    credentials:true
}));
app.use(cookieParser());



app.get("/",(req,res)=>{
    console.log("Test Route hit");
})

app.use("/api/user", UserRouter);
app.use("/api/product", ProductRouter)
app.use("/api/cart", CartRouter);
app.use("/api/review", ReviewRouter);
app.use("/api/newsletter", NewsletterRouter);

app.listen(Port, ()=>{
    console.log('Server is Runnig on port '+ Port);
    ConnectDB();
})