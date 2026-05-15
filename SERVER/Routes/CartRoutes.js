const express = require("express");

const {
    AddToCart,
    GetMyCart,
    UpdateCartItem,
    RemoveCartItem,
    ClearCart
} = require("../Controllers/CartController");

const { Auth } = require("../Middlewares/Auth");

const CartRouter = express.Router();

CartRouter.post("/add-cart", Auth("user", "admin"),AddToCart);

CartRouter.get("/my-cart",Auth( "user", "admin"), GetMyCart);

CartRouter.put("/update-cart/:cartItemId", Auth("user", "admin"),UpdateCartItem);

CartRouter.delete("/remove-cart/:cartItemId", Auth("user", "admin"), RemoveCartItem);

CartRouter.delete("/clear-cart", Auth("user", "admin"), ClearCart);




module.exports = CartRouter;