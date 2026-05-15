const Product = require("../Models/Product");
const cloudinary = require("../config/cloudinaryConfig");
const streamifier = require("streamifier");
const slugify = require("slugify");



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

        let existProduct = await Product.findOne({ title });

        if (existProduct) return res.json({ success: false, message: "Product with this title already exists" });

        if (!req.files || req.files.length === 0) {

            return res.json({
                success: false,
                message: "Please upload product images"
            });

        }

        let uploadedImages = [];

        for (let file of req.files) {
            const result = await uploadImage(file.buffer);

            uploadedImages.push(result.secure_url);
        }

        let finalPrice = price - (price * discountPercent) / 100;


        let totalStock = 0;

        let parsedVariants = variants ? JSON.parse(variants) : [];

        parsedVariants.forEach((variant) => {
            variant.sizes.forEach((item) => {
                totalStock += item.stock;
            });
        });

        let slug = slugify(title, {
            lower: true,
            strict: true
        }) + "-" + Date.now();

        let sku = "SKU-" + Date.now();

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
            totalStock,
            sku
        });
        await newProduct.save();

        res.json({ success: true, message: "Product Added Successfully", product: newProduct });

    } catch (error) {
        res.json({ success: false, message: "Error Adding Product", error: error.message });
    }
}




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

        query.isActive = true;

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

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

        if (minPrice || maxPrice) {
            query.finalPrice = {};

            if (minPrice) {
                query.finalPrice.$gte = Number(minPrice);
            }

            if (maxPrice) {
                query.finalPrice.$lte = Number(maxPrice);
            }
        }

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

        let skip =
            (Number(page) - 1) * Number(limit);

        let products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        let totalProducts = await Product.countDocuments(query);

        res.json({
            success: true, totalProducts, currentPage: Number(page), totalPages: Math.ceil(totalProducts / limit), products
        });

    } catch (error) {
        res.json({ success: false, message: error.message });

    }
}



async function GetSingleProduct(req, res) {

    try {
        let { id } = req.params;
let product = await Product.findOne({
    _id:id,
    isActive:true
});
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }


        product.views += 1;

        await product.save();

        res.json({ success: true, product });

    } catch (error) {

        res.json({ success: false, message: error.message });

    }
}



async function UpdateProduct(req, res) {

    try {
        let { id } = req.params;

        let product = await Product.findById(id);

        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        let uploadedImages = product.images;

        if (req.files && req.files.length > 0) {

            uploadedImages = [];

            for (let file of req.files) {
                const result = await uploadImage(file.buffer); uploadedImages.push(result.secure_url);

            }

        }


        req.body.price = Number(req.body.price);
        req.body.discountPercent = Number(req.body.discountPercent);

        price = Number(price);

        discountPercent = Number(discountPercent);

        let finalPrice = req.body.price - (req.body.price * req.body.discountPercent) / 100;

        let totalStock = 0;

        let parsedVariants =
            req.body.variants
                ? JSON.parse(req.body.variants)
                : product.variants;



        parsedVariants.forEach((variant) => {

            variant.sizes.forEach((item) => {

                totalStock += item.stock;

            });

        });

        await Product.findByIdAndUpdate(id, {
            ...req.body,
            finalPrice,
            totalStock,
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


        res.json({ success: true, message: "Product Updated Successfully" });

    } catch (error) {

        res.json({ success: false, message: error.message });

    }
}




async function DeleteProduct(req, res) {

    try {

        let { id } = req.params;
        let product = await Product.findById(id);

        if (!product) {
            return res.json({success: false, message: "Product not found" });
        }


        if (!product.isActive) {

            return res.json({ success: false, message: "Product already deleted"});

        }

        product.isActive = false;

        await product.save();

        res.json({success: true, message: "Product Deleted Successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message});

    }
}
async function FeaturedProducts(req, res) {

    try {

        let products = await Product.find({

            isFeatured: true,
            isActive: true

        }).sort({ createdAt: -1 });


        res.json({ success: true, products });

    } catch (error) {

        res.json({ success: false, message: error.message });

    }
}



async function TrendingProducts(req, res) {

    try {

        let products = await Product.find({
            isTrending: true,
            isActive: true
        }).sort({ soldCount: -1 });

        res.json({ success: true, products });

    } catch (error) {
        res.json({ success: false, message: error.message });

    }
}



async function NewArrivals(req, res) {

    try {

        let products = await Product.find({
            isNewArrival: true,
            isActive: true
        })
            .sort({ createdAt: -1 })

            .limit(10);

        res.json({ success: true, products });

    } catch (error) {
        res.json({ success: false, message: error.message });

    }
}



async function RelatedProducts(req, res) {

    try {

        let { id } = req.params;

        let currentProduct = await Product.findById(id);

        if (!currentProduct) {

            return res.json({ success: false, message: "Product not found" });
        }

        let relatedProducts = await Product.find({
            _id: { $ne: id },
            category: currentProduct.category,
            gender: currentProduct.gender,
            isActive: true
        }).limit(8);

        res.json({ success: true, products: relatedProducts });

    } catch (error) {
        res.json({ success: false, message: error.message });

    }
}




async function ProductAnalytics(req, res) {

    try {

        let totalProducts = await Product.countDocuments();

        let activeProducts = await Product.countDocuments({ isActive: true });



        let featuredProducts = await Product.countDocuments({ isFeatured: true });

        let trendingProducts = await Product.countDocuments({ isTrending: true });

        let newArrivalProducts = await Product.countDocuments({ isNewArrival: true });

        let outOfStockProducts = await Product.countDocuments({ totalStock: 0 });


        res.json({
            success: true,
            analytics: {
                totalProducts,
                activeProducts,
                featuredProducts,
                trendingProducts,
                newArrivalProducts,
                outOfStockProducts
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });

    }
}




module.exports = { AddProduct, GetAllProducts, GetSingleProduct, UpdateProduct, DeleteProduct, FeaturedProducts, TrendingProducts, NewArrivals, RelatedProducts, ProductAnalytics };