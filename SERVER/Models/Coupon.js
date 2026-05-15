let mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

  code: {type:String, unique: true, required:true},
  discountType: {type: String, enum: ["percent", "flat"], required:true},
  discountValue: {type:Number, required:true},
  minOrderAmount: {type:Number,  default:0},
  expireAt: {type:Date},
  active: {type: Boolean,default: true}

}, {
    timestamps: true 
});

let Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;