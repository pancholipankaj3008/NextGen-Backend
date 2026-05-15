let express = require("express");

const {
    // AUTH
    SignUp,
    Login,
    Logout,
    // ForgotPassword,
    // ResetPassword,

    // PROFILE
    GetProfile,
    UpdateProfile,

    // ADDRESS
    AddAddress,
    RemoveAddress,

    // WISHLIST
    GetWishlist,
    AddToWishlist,
    RemoveWishlist,

    // ADMIN
    CreateByAdmin,
    GetAllUsers,
    DeleteUser,
    UpdateUserByAdmin,
    BlockUser,
    UnblockUser,
    UserAnalytics

} = require("../Controllers/UserController");

const { Auth } = require("../Middlewares/Auth");

let UserRouter = express.Router();

// AUTH ROUTES
UserRouter.post("/signup", SignUp);
UserRouter.post("/login", Login);
UserRouter.post("/logout", Auth("user", "admin", "product manager", "order manager", "inventory staff" ), Logout);
// UserRouter.post("/forgot-password", ForgotPassword);
// UserRouter.post("/reset-password/:resetToken",ResetPassword);


// PROFILE ROUTES
UserRouter.get("/profile", Auth("user", "admin", "product manager", "order manager", "inventory staff"), GetProfile);
UserRouter.put("/update-profile", Auth("user", "admin", "product manager", "order manager", "inventory staff"), UpdateProfile);


// ADDRESS ROUTES
UserRouter.post("/add-address", Auth("user", "admin"), AddAddress);
UserRouter.delete("/remove-address/:addressId", Auth("user", "admin"),RemoveAddress);



// WISHLIST ROUTES
UserRouter.get("/wishlist",Auth("user","admin"),GetWishlist);
UserRouter.post("/add-wishlist/:productId",Auth("user","admin"),AddToWishlist);
UserRouter.delete("/remove-wishlist/:productId",Auth("user","admin"), RemoveWishlist);



// ADMIN ROUTES
UserRouter.post("/create-user",Auth("admin"),CreateByAdmin);
UserRouter.get("/all-users",Auth("admin"),GetAllUsers);
UserRouter.delete("/delete-user/:id",Auth("admin"),DeleteUser);
UserRouter.put("/update-user/:id",Auth("admin"),UpdateUserByAdmin);
UserRouter.put("/block-user/:id",Auth("admin"),BlockUser);
UserRouter.put("/unblock-user/:id", Auth("admin"),UnblockUser);
UserRouter.get("/user-analytics",Auth("admin"),UserAnalytics);


module.exports= UserRouter ;