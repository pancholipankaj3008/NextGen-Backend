let mongoose = require('mongoose');

let addressSchema = mongoose.Schema({
    fullname: { type: String },
    phone: { type: String },
    pincode: { type: String },
    state: { type: String },
    city: { type: String },
    houseNo: { type: String },
    area: { type: String },
    landmark: { type: String },
}, {
    _id: true
})

let userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "product manager", "order manager", "inventory staff"], default: "user" },
    phone: { type: String },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String },
    addresses: [addressSchema],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    isBlocked: {type: Boolean, default: false}
}, {
    timestamps: true
});

let User = mongoose.model("User", userSchema);

module.exports = User;