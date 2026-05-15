let mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    color: { type: String, required: true },

    images: [String],

    sizes: [{
        size: { type: String, enum: ["XS", "S", "M", "L", "XL", "XXL"] },
        stock: { type: Number, default: 0 }
    }]
}, {
    _id: false
});



let productSchema = mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    brand: { type: String, default: "Your Brand Name" },
    category: { type: String, enum: ["T-Shirts", "Shirts", "Jeans", "Hoodies", "Jackets", "Shorts", "Tracks", "Sweaters"] },
    gender: { type: String, enum: ["Men", "Women", "Unisex", "Kids"] },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    finalPrice: { type: Number },
    fabric: { type: String },
    fitType: { type: String, enum: ["Regular", "Slim", "Oversized", "Relaxed"] },

    sleeveType: { type: String, enum: ["Half Sleeve", "Full Sleeve", "Sleeveless"] },

    neckType: { type: String, enum: ["Round Neck", "V Neck", "Collar", "Hooded"] },

    images: [String],

    variants: [variantSchema],

    ratings: { type: Number, default: 0 },

    numReviews: { type: Number, default: 0 },

    soldCount: { type: Number, default: 0 },

    views: { type: Number, default: 0 },

    tags: [{ type: String }],

    collection: { type: String, enum: ["Summer Collection", "Winter Drop", "Streetwear Collection", "Limited Edition"] },

    returnPolicy: { type: String, default: "7 Days Easy Return" },

    careInstructions: [{ type: String }],

    totalStock:{type:Number, default:0 },

    seoTitle:{type:String},

    seoDescription:{type:String},

    isFeatured: { type: Boolean, default: false },

    isNewArrival: { type: Boolean, default: false },

    isTrending: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },

    deletedAt:{ type:Date, default:null},
    
    sku: { type: String, unique: true }


},
    {
        timestamps: true
    });

let Product = mongoose.model("Product", productSchema);

module.exports = Product;
