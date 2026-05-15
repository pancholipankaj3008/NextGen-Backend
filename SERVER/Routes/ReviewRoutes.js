

const express = require("express");

const {

    AddReview,

    GetProductReviews,

    DeleteReview

} = require("../Controllers/ReviewController");

const { Auth } = require("../Middlewares/Auth");

const ReviewRouter = express.Router();


ReviewRouter.post("/add-review/:productId", Auth( "user", "admin"), AddReview);

ReviewRouter.get("/product-reviews/:productId", GetProductReviews);

ReviewRouter.delete("/delete-review/:id", Auth("user", "admin" ), DeleteReview);


module.exports = ReviewRouter;