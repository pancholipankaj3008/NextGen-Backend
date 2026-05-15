
const Cart = require("../Models/Cart");
const Product = require("../Models/Product");



async function AddToCart(req, res) {

    try {

        let {
            productId,
            color,
            size,
            quantity
        } = req.body;

        quantity = Number(quantity);

        let product = await Product.findOne({ _id: productId, isActive: true});

        if (!product) {

            return res.json({success: false, message: "Product not found"});

        }

        let selectedVariant = product.variants.find((variant) =>
                variant.color === color
            );

        if (!selectedVariant) {
            return res.json({success: false, message: "Color not available"});
        }

        let selectedSize = selectedVariant.sizes.find((item) =>
                item.size === size
            );



        if (!selectedSize) {

            return res.json({success: false,message: "Size not available"});

        }

        if (selectedSize.stock < quantity) {

            return res.json({success: false, message: "Insufficient stock"});

        }

        let cart = await Cart.findOne({user: req.id});


        if (!cart) {
            cart = new Cart({ user: req.id, items: []});
        }

        let existingItem = cart.items.find((item) =>
                    item.product.toString() === productId &&
                    item.color === color &&
                    item.size === size
            );

        if (existingItem) {
            existingItem.quantity += quantity;
        }else {

            cart.items.push({product: productId,color,size,quantity});

        }

        await cart.save();

        res.json({success: true, message: "Product added to cart", cart

        });

    } catch (error) {

        res.json({success: false, message: error.message });

    }
}



async function GetMyCart(req, res) {

    try {

        let cart = await Cart.findOne({user: req.id}).populate("items.product");

        if (!cart) {

            return res.json({success: true,cart: {items: []} });

        }




        let subtotal = 0;

        let totalQuantity = 0;




        cart.items.forEach((item) => {
            subtotal += item.product.finalPrice * item.quantity;
            totalQuantity += item.quantity;
        });




        res.json({success: true,subtotal,totalQuantity,cart});

    } catch (error) {

        res.json({ success: false, message: error.message});

    }
}



async function UpdateCartItem(req, res) {

    try {

        let { cartItemId } = req.params;

        let { quantity } = req.body;

        quantity = Number(quantity);

        let cart = await Cart.findOne({user: req.id}).populate("items.product");

        if (!cart) {
            return res.json({ success: false, message: "Cart not found"});
        }

        let cartItem = cart.items.id(cartItemId);

        if (!cartItem) {

            return res.json({success: false, message: "Cart item not found"});
        }


        let product = cartItem.product;

        let selectedVariant = product.variants.find((variant) => 
            variant.color === cartItem.color
        );

        let selectedSize = selectedVariant.sizes.find((item) =>
            item.size === cartItem.size
        );


        if (selectedSize.stock < quantity) {

            return res.json({success: false, message: "Insufficient stock"});

        }

        cartItem.quantity = quantity;

        await cart.save();

        res.json({success: true, message: "Cart updated successfully", cart
        });

    } catch (error) {

        res.json({success: false, message: error.message});

    }
}



async function RemoveCartItem(req, res) {

    try {
        let { cartItemId } = req.params;
        let cart = await Cart.findOne({user: req.id});

        if (!cart) {
            return res.json({ success: false, message: "Cart not found"});
        }

        cart.items.pull(cartItemId);
        await cart.save();

        res.json({success: true, message: "Item removed from cart"});

    } catch (error) {
        res.json({ success: false, message: error.message});

    }
}


async function ClearCart(req, res) {

    try {

        let cart = await Cart.findOne({user: req.id});

        if (!cart) {
            return res.json({success: false, message: "Cart not found"});
        }
        cart.items = [];

        await cart.save();

        res.json({success: true, message: "Cart cleared successfully" });

    } catch (error) {

        res.json({success: false,message: error.message});

    }
}






module.exports = { AddToCart, GetMyCart, UpdateCartItem, RemoveCartItem, ClearCart};