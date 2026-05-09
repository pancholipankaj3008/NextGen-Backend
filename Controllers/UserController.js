const User = require("../Models/User");
const bcrypt = require('bcrypt');
const { json } = require("express");
const saltRounds = 10;
let jwt = require("jsonwebtoken");


async function SignUp(req, res) {
    try {
        let { email, password } = req.body;

        let existUser = await User.findOne({ email });

        if (existUser) return res.json({ success: false, message: "User already exists" });

        bcrypt.hash(password, saltRounds, async function (err, hash) {
            if (err) return res.json({ success: false, message: err.message });

            let newUser = new User({ ...req.body, password: hash, role: "user" });

            await newUser.save();

            res.json({ success: true, message: "User Registerd Successfully" });

        });


    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


async function Login(req, res) {
    try {
        let { email, password } = req.body;

        let existUser = await User.findOne({ email });

        if (!existUser) return res.json({ success: false, message: "User not found" });

        if (existUser.isBlocked) {
            return res.json({
                success: false,
                message: "Your account has been blocked"
            });
        }

        bcrypt.compare(password, existUser.password, function (err, result) {
            if (err) return res.json({ success: false, message: err.message });

            if (!result) return res.json({ success: false, message: "Invalid Password" });

            let accessToken = jwt.sign({
                id: existUser._id,
                role: existUser.role
            }, process.env.ACCESS, { expiresIn: '15m' });

            let refreshToken = jwt.sign({
                id: existUser._id,
                role: existUser.role
            }, process.env.REFRESH, { expiresIn: '7d' });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 15 * 60 * 1000
            })

            res.json({ success: true, message: "Login Successfully" });

        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


async function Logout(req, res) {

    try {

        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");

        res.json({ success: true, message: "Logout Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}





async function GetProfile(req, res) {
    try {
        let user = await User.findById(req.id).select("-password");
        if (!user) return res.json({ success: false, message: "User not found" });

        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

async function UpdateProfile(req, res) {
    try {

        await User.findByIdAndUpdate(req.id, req.body);

        res.json({ success: true, message: "Profile Updated" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

async function AddAddress(req, res) {
    try {
        let user = await User.findById(req.id);

        if (!user) return res.json({ success: false, message: "User not found" });

        user.addresses.push(req.body);

        await user.save();

        res.json({ success: true, message: "address Added Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }

}


async function RemoveAddress(req, res) {
    try {
        let { addressId } = req.params;

        let user = await User.findById(req.id);

        user.addresses.pull(addressId);

        await user.save();

        res.json({ success: true, message: "Address Deleted Successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });

    }
}


async function GetWishlist(req, res) {
    try {
        let user = await User.findById(req.id);

        if (!user.wishlist) return res.json({ success: false, message: "Wishlist is empty" });

        res.json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

async function AddToWishlist(req, res) {
    try {
        let { productId } = req.params;
        let user = await User.findById(req.id);

        user.wishlist.push(productId);

        await user.save();

        res.json({ success: true, message: "Added to wishlist" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

async function RemoveWishlist(req, res) {
    try {
        let { productId } = req.params;
        let user = await User.findById(req.id);

        user.wishlist.pull(productId);

        await user.save();

        res.json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}




async function CreateByAdmin(req, res) {
    try {
        let { email, password, role } = req.body;
        let existUser = await User.findOne({ email });

        if (existUser) return res.json({ success: false, message: "User already exists with this email" });

        bcrypt.hash(password, saltRounds, async function (err, hash) {
            if (err) return res.json({
                success: false,
                message: err.message
            });

            let newUser = new User({ ...req.body, password: hash });

            await newUser.save();

            res.json({ success: true, message: "User Created Successfully" });

        })
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


async function GetAllUsers(req, res) {

    try {
        let users = await User.find();

        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }

}

async function DeleteUser(req, res) {
    try {
        let { id } = req.params;
        await User.findByIdAndDelete(id);

        res.json({ success: true, message: "User Deleted Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}



async function UpdateUserByAdmin(req, res) {

    try {

        let { id } = req.params;

        let user = await User.findById(id);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }


        if (req.body.password) {
            delete req.body.password;
        }

        await User.findByIdAndUpdate(id, req.body);

        res.json({
            success: true,
            message: "User Updated Successfully"
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }
};




async function BlockUser(req, res) {

    try {

        let { id } = req.params;

        let user = await User.findById(id);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isBlocked) {
            return res.json({
                success: false,
                message: "User already blocked"
            });
        }

        user.isBlocked = true;

        await user.save();

        res.json({
            success: true,
            message: "User Blocked Successfully"
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }
}




async function UnblockUser(req, res) {

    try {

        let { id } = req.params;

        let user = await User.findById(id);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isBlocked) {
            return res.json({
                success: false,
                message: "User already unblocked"
            });
        }

        user.isBlocked = false;

        await user.save();

        res.json({
            success: true,
            message: "User Unblocked Successfully"
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }
}




async function UserAnalytics(req, res) {

    try {

        // total users
        let totalUsers = await User.countDocuments();

        // total admins
        let totalAdmins = await User.countDocuments({
            role: "admin"
        });

        // blocked users
        let blockedUsers = await User.countDocuments({
            isBlocked: true
        });

        // verified users
        let verifiedUsers = await User.countDocuments({
            isVerified: true
        });

        // users created in last 30 days
        let lastMonthUsers = await User.countDocuments({
            createdAt: {
                $gte: new Date(
                    new Date().setDate(new Date().getDate() - 30)
                )
            }
        });

        res.json({
            success: true,

            analytics: {
                totalUsers,
                totalAdmins,
                blockedUsers,
                verifiedUsers,
                lastMonthUsers
            }
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }
}




module.exports = { SignUp, Login, Logout, GetProfile, UpdateProfile, AddAddress, RemoveAddress, AddToWishlist, RemoveWishlist, GetAllUsers, GetWishlist, CreateByAdmin, GetAllUsers, DeleteUser, UpdateUserByAdmin, BlockUser, UnblockUser, UserAnalytics };