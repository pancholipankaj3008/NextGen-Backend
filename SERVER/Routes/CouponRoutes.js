const express = require("express");

const {CreateCoupon,  GetAllCoupons, ApplyCoupon, UpdateCoupon,DeleteCoupon} = require("../Controllers/CouponController");

const { Auth } = require("../Middlewares/Auth");

const CouponRouter = express.Router();


CouponRouter.post( "/create-coupon", Auth("admin"),CreateCoupon);

CouponRouter.get("/all-coupons",Auth("admin" ),GetAllCoupons);

CouponRouter.post( "/apply-coupon", Auth("user","admin"), ApplyCoupon);

CouponRouter.put("/update-coupon/:id",Auth( "admin"),UpdateCoupon);

CouponRouter.delete("/delete-coupon/:id", Auth("admin" ), DeleteCoupon);


module.exports = CouponRouter;