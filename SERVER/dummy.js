// ======================================
// Controllers/ProductController.js
// ======================================

const Product = require("../Models/Product");

const cloudinary = require("../config/cloudinaryConfig");

const streamifier = require("streamifier");

const slugify = require("slugify");



// ======================================
// CLOUDINARY IMAGE UPLOAD FUNCTION
// ======================================

const uploadImage = async (fileBuffer) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(

            {
                folder: "clothing-brand-products"
            },

            (error, result) => {

                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }

            }
        );

        streamifier
            .createReadStream(fileBuffer)
            .pipe(stream);

    });
};



// ======================================
// ADD PRODUCT
// ======================================

async function AddProduct(req, res) {

    try {

        let {

            title,
            description,
            shortDescription,
            brand,
            category,
            gender,
            price,
            discountPercent,
            fabric,
            fitType,
            sleeveType,
            neckType,
            variants,
            tags,
            collection,
            returnPolicy,
            careInstructions,
            isFeatured,
            isNewArrival,
            isTrending

        } = req.body;



        // CHECK PRODUCT
        let existProduct = await Product.findOne({ title });

        if (existProduct) {

            return res.json({
                success: false,
                message: "Product already exists"
            });

        }



        // IMAGE VALIDATION
        if (!req.files || req.files.length === 0) {

            return res.json({
                success: false,
                message: "Please upload product images"
            });

        }



        // UPLOAD IMAGES
        let uploadedImages = [];

        for (let file of req.files) {

            const result = await uploadImage(file.buffer);

            uploadedImages.push(result.secure_url);

        }



        // FINAL PRICE
        let finalPrice =
            price -
            (price * discountPercent) / 100;



        // SLUG
        let slug = slugify(title, {
            lower: true,
            strict: true
        });



        // SKU
        let sku = "SKU-" + Date.now();



        // CREATE PRODUCT
        let newProduct = new Product({

            title,
            slug,
            description,
            shortDescription,
            brand,
            category,
            gender,
            price,
            discountPercent,
            finalPrice,
            fabric,
            fitType,
            sleeveType,
            neckType,

            images: uploadedImages,

            variants:
                variants
                    ? JSON.parse(variants)
                    : [],

            tags:
                tags
                    ? JSON.parse(tags)
                    : [],

            collection,

            returnPolicy,

            careInstructions:
                careInstructions
                    ? JSON.parse(careInstructions)
                    : [],

            isFeatured,
            isNewArrival,
            isTrending,

            sku

        });



        await newProduct.save();



        res.json({

            success: true,

            message: "Product Added Successfully",

            product: newProduct

        });

    } catch (error) {

        res.json({

            success: false,

            message: error.message

        });

    }
}




// ======================================
// GET ALL PRODUCTS
// ======================================

async function GetAllProducts(req, res) {

    try {

        let {

            search,
            category,
            gender,
            collection,
            fitType,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 10

        } = req.query;



        let query = {};



        // SEARCH
        if (search) {

            query.title = {
                $regex: search,
                $options: "i"
            };

        }



        // FILTERS
        if (category) {
            query.category = category;
        }

        if (gender) {
            query.gender = gender;
        }

        if (collection) {
            query.collection = collection;
        }

        if (fitType) {
            query.fitType = fitType;
        }



        // PRICE FILTER
        if (minPrice || maxPrice) {

            query.finalPrice = {};

            if (minPrice) {
                query.finalPrice.$gte = Number(minPrice);
            }

            if (maxPrice) {
                query.finalPrice.$lte = Number(maxPrice);
            }

        }



        // SORTING
        let sortOption = {};

        if (sort === "lowToHigh") {
            sortOption.finalPrice = 1;
        }

        else if (sort === "highToLow") {
            sortOption.finalPrice = -1;
        }

        else if (sort === "newest") {
            sortOption.createdAt = -1;
        }

        else if (sort === "popular") {
            sortOption.soldCount = -1;
        }



        // PAGINATION
        let skip =
            (Number(page) - 1) * Number(limit);



        // PRODUCTS
        let products = await Product.find(query)

            .sort(sortOption)

            .skip(skip)

            .limit(Number(limit));



        // TOTAL PRODUCTS
        let totalProducts =
            await Product.countDocuments(query);



        res.json({

            success: true,

            totalProducts,

            currentPage: Number(page),

            totalPages:
                Math.ceil(totalProducts / limit),

            products

        });

    } catch (error) {

        res.json({

            success: false,

            message: error.message

        });

    }
}




// ======================================
// GET SINGLE PRODUCT
// ======================================

async function GetSingleProduct(req, res) {

    try {

        let { id } = req.params;



        let product = await Product.findById(id);



        if (!product) {

            return res.json({
                success: false,
                message: "Product not found"
            });

        }



        // INCREASE VIEW COUNT
        product.views += 1;

        await product.save();



        res.json({

            success: true,

            product

        });

    } catch (error) {

        res.json({

            success: false,

            message: error.message

        });

    }
}




// ======================================
// UPDATE PRODUCT
// ======================================

async function UpdateProduct(req, res) {

    try {

        let { id } = req.params;



        let product = await Product.findById(id);

        if (!product) {

            return res.json({
                success: false,
                message: "Product not found"
            });

        }



        // NEW IMAGES
        let uploadedImages = product.images;



        if (req.files && req.files.length > 0) {

            uploadedImages = [];

            for (let file of req.files) {

                const result =
                    await uploadImage(file.buffer);

                uploadedImages.push(result.secure_url);

            }

        }



        // FINAL PRICE
        let finalPrice =
            req.body.price -
            (req.body.price *
                req.body.discountPercent) / 100;



        // UPDATE
        await Product.findByIdAndUpdate(id, {

            ...req.body,

            finalPrice,

            slug: slugify(req.body.title, {
                lower: true,
                strict: true
            }),

            images: uploadedImages,

            variants:
                req.body.variants
                    ? JSON.parse(req.body.variants)
                    : product.variants,

            tags:
                req.body.tags
                    ? JSON.parse(req.body.tags)
                    : product.tags,

            careInstructions:
                req.body.careInstructions
                    ? JSON.parse(req.body.careInstructions)
                    : product.careInstructions

        });



        res.json({

            success: true,

            message: "Product Updated Successfully"

        });

    } catch (error) {

        res.json({

            success: false,

            message: error.message

        });

    }
}




// ======================================
// DELETE PRODUCT
// ======================================

async function DeleteProduct(req, res) {

    try {

        let { id } = req.params;



        let product = await Product.findById(id);

        if (!product) {

            return res.json({
                success: false,
                message: "Product not found"
            });

        }



        await Product.findByIdAndDelete(id);



        res.json({

            success: true,

            message: "Product Deleted Successfully"

        });

    } catch (error) {

        res.json({

            success: false,

            message: error.message

        });

    }
}




// ======================================
// EXPORTS
// ======================================

module.exports = {

    AddProduct,

    GetAllProducts,

    GetSingleProduct,

    UpdateProduct,

    DeleteProduct

};