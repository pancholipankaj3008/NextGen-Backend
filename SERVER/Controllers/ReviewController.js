

const Review = require("../Models/Review");

const Product = require("../Models/Product");


async function AddReview(req, res) {

    try {

        let { productId } = req.params;
        let {rating,comment } = req.body;
        rating = Number(rating);

        let product = await Product.findOne({_id: productId, isActive: true});

        if (!product) return res.json({success: false, message: "Product not found"});

        let existingReview = await Review.findOne({user: req.id, product: productId});

        if (existingReview) return res.json({success: false,message: "You already reviewed this product"});

        let newReview = new Review({ user: req.id, product: productId, rating, comment});

        await newReview.save();

        let reviews = await Review.find({product: productId});

        let totalRating = 0;

        reviews.forEach((review) => {
            totalRating += review.rating; 
        });

        let averageRating = totalRating / reviews.length;

        product.ratings = averageRating.toFixed(1);

        product.numReviews = reviews.length;

        await product.save();
        res.json({ success: true, message: "Review added successfully", review: newReview});

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

async function GetProductReviews(req, res) {

    try {

        let { productId } = req.params;
        let reviews = await Review.find({product: productId}).populate("user","name avatar").sort({createdAt: -1});

        res.json({success: true, totalReviews: reviews.length, reviews});

    } catch (error) {
        res.json({ success: false, message: error.message});

    }
}


async function DeleteReview(req, res) {

    try {
        let { id } = req.params;
        let review = await Review.findById(id);
        if (!review) {
            return res.json({success: false, message: "Review not found"});
        }

        if (review.user.toString() !== req.id && req.role !== "admin") {
            return res.json({success: false, message: "Unauthorized user"});
        }
        let product = await Product.findById(review.product);

        await Review.findByIdAndDelete(id);

        let reviews = await Review.find({product: review.product});

        if (reviews.length === 0) {
            product.ratings = 0;
            product.numReviews = 0;
        }

        else {
            let totalRating = 0;
            reviews.forEach((item) => {
                totalRating += item.rating;
            });

            product.ratings =( totalRating / reviews.length ).toFixed(1);

            product.numReviews = reviews.length;
        }

        await product.save();

        res.json({ success: true, message: "Review deleted successfully"});

    } catch (error) {

        res.json({success: false,message: error.message});

    }
}


module.exports = { AddReview, GetProductReviews, DeleteReview};