
const Coupon = require("../Models/Coupon");

async function CreateCoupon(req, res) {

    try {
        let {code, discountType, discountValue, minOrderAmount, expireAt } = req.body;
        code = code.toUpperCase();

        let existingCoupon = await Coupon.findOne({code});
        if (existingCoupon) {
            return res.json({success: false, message: "Coupon already exists"});
        }

        let newCoupon = new Coupon({code, discountType, discountValue, minOrderAmount, expireAt});
        await newCoupon.save();
        
        res.json({ success: true, message: "Coupon created successfully", coupon: newCoupon});

    } catch (error) {
        res.json({ success: false, message: error.message});

    }
}


async function GetAllCoupons(req, res) {

    try {

        let coupons = await Coupon.find().sort({createdAt: -1});

        res.json({ success: true, totalCoupons: coupons.length, coupons});

    } catch (error) {
        res.json({success: false, message: error.message});

    }
}



async function ApplyCoupon(req, res) {

    try {
        let { code, subtotal} = req.body;
        subtotal = Number(subtotal);
        let coupon = await Coupon.findOne({code: code.toUpperCase(),active: true });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid coupon"});
        }
        if (new Date(coupon.expireAt) < new Date()) {

            return res.json({success: false, message: "Coupon expired" });
        }

        if (subtotal < coupon.minOrderAmount) {

            return res.json({success: false, message:`Minimum order amount is ₹${coupon.minOrderAmount}`});
        }

        let discountAmount = 0;

        if (coupon.discountType === "percent") {
            discountAmount = (subtotal * coupon.discountValue) / 100;
        }else if (coupon.discountType === "flat") {
            discountAmount = coupon.discountValue;
        }

        let finalTotal = subtotal - discountAmount;

        if (finalTotal < 0) {
            finalTotal = 0;
        }

        res.json({ success: true, message: "Coupon applied successfully", couponCode: coupon.code, discountAmount, finalTotal});

    } catch (error) {

        res.json({success: false, message: error.message });

    }
}

async function UpdateCoupon(req, res) {

    try {
        let { id } = req.params;
        let coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.json({success: false, message: "Coupon not found" });
        }
        await Coupon.findByIdAndUpdate(id, req.body);

        res.json({ success: true, message: "Coupon updated successfully"});

    } catch (error) {

        res.json({ success: false, message: error.message});

    }
}



async function DeleteCoupon(req, res) {

    try {
        let { id } = req.params;
        let coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.json({success: false, message: "Coupon not found"});
        }
        await Coupon.findByIdAndDelete(id);
        res.json({ success: true, message: "Coupon deleted successfully"});

    } catch (error) {

        res.json({ success: false, message: error.message});

    }
}


module.exports = {CreateCoupon, GetAllCoupons, ApplyCoupon, UpdateCoupon, DeleteCoupon};