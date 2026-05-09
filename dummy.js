// ===============================
// Controllers/UserController.js
// ===============================

const User = require("../Models/UserSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const saltRounds = 10;


// ===============================
// SIGNUP
// ===============================

async function SignUp(req, res) {
  try {
    let { email, password } = req.body;

    let existUser = await User.findOne({ email });

    if (existUser) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      let newUser = new User({
        ...req.body,
        password: hash
      });

      await newUser.save();

      res.json({
        success: true,
        message: "User Registered Successfully"
      });
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// LOGIN
// ===============================

async function LogIn(req, res) {
  try {
    let { email, password } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    bcrypt.compare(password, user.password, (err, result) => {

      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      if (!result) {
        return res.json({
          success: false,
          message: "Invalid Password"
        });
      }

      let accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.ACCESS,
        { expiresIn: "15m" }
      );

      let refreshToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.REFRESH,
        { expiresIn: "7d" }
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 15 * 60 * 1000
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        message: "Login Successful"
      });

    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// LOGOUT
// ===============================

async function LogOut(req, res) {
  try {

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logout Successfully"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// FORGOT PASSWORD
// ===============================

async function ForgotPassword(req, res) {
  try {

    let { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    let resetToken = jwt.sign(
      { email },
      process.env.RESET,
      { expiresIn: "15m" }
    );

    let resetLink =
      `http://localhost:5173/reset-password/${resetToken}`;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `
        <h2>Password Reset</h2>
        <a href="${resetLink}">${resetLink}</a>
      `
    });

    res.json({
      success: true,
      message: "Reset link sent"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// RESET PASSWORD
// ===============================

async function ResetPassword(req, res) {
  try {

    let { resetToken } = req.params;
    let { newPassword } = req.body;

    let decoded = jwt.verify(
      resetToken,
      process.env.RESET
    );

    bcrypt.hash(newPassword, saltRounds, async (err, hash) => {

      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      await User.findOneAndUpdate(
        { email: decoded.email },
        { password: hash }
      );

      res.json({
        success: true,
        message: "Password Reset Successfully"
      });

    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// GET PROFILE
// ===============================

async function GetProfile(req, res) {
  try {

    let user = await User.findById(req.id).select("-password");

    res.json({
      success: true,
      user
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// UPDATE PROFILE
// ===============================

async function UpdateProfile(req, res) {
  try {

    await User.findByIdAndUpdate(req.id, req.body);

    res.json({
      success: true,
      message: "Profile Updated"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// ADD ADDRESS
// ===============================

async function AddAddress(req, res) {
  try {

    await User.findByIdAndUpdate(req.id, {
      $push: {
        addresses: req.body
      }
    });

    res.json({
      success: true,
      message: "Address Added"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// DELETE ADDRESS
// ===============================

async function DeleteAddress(req, res) {
  try {

    let { addressId } = req.params;

    await User.findByIdAndUpdate(req.id, {
      $pull: {
        addresses: { _id: addressId }
      }
    });

    res.json({
      success: true,
      message: "Address Deleted"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// GET WISHLIST
// ===============================

async function GetWishlist(req, res) {
  try {

    let user = await User.findById(req.id)
      .populate("wishlist");

    res.json({
      success: true,
      wishlist: user.wishlist
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// ADD WISHLIST
// ===============================

async function AddToWishlist(req, res) {
  try {

    let { productId } = req.params;

    await User.findByIdAndUpdate(req.id, {
      $addToSet: {
        wishlist: productId
      }
    });

    res.json({
      success: true,
      message: "Added to wishlist"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



// ===============================
// REMOVE WISHLIST
// ===============================

async function RemoveWishlist(req, res) {
  try {

    let { productId } = req.params;

    await User.findByIdAndUpdate(req.id, {
      $pull: {
        wishlist: productId
      }
    });

    res.json({
      success: true,
      message: "Removed from wishlist"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
}



module.exports = {
  SignUp,
  LogIn,
  LogOut,
  ForgotPassword,
  ResetPassword,
  GetProfile,
  UpdateProfile,
  AddAddress,
  DeleteAddress,
  GetWishlist,
  AddToWishlist,
  RemoveWishlist
};
