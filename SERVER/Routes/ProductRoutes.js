const express = require("express");
const { DeleteProduct,
    AddProduct,
    GetAllProducts,
    GetSingleProduct,
    UpdateProduct,
    FeaturedProducts,
    TrendingProducts,
    NewArrivals,
    RelatedProducts,
    ProductAnalytics,
} = require("../Controllers/ProductController");

const { Auth } = require("../Middlewares/Auth");

const upload = require("../Middlewares/Multer");


const ProductRouter = express.Router();




ProductRouter.post("/add-product", Auth("admin", "product manager"), upload.array("images", 10), AddProduct);

ProductRouter.get("/all-products", GetAllProducts);

ProductRouter.get("/single-product/:id", GetSingleProduct);

ProductRouter.put("/update-product/:id", Auth("admin", "product manager"), upload.array("images", 10), UpdateProduct);

ProductRouter.delete("/delete-product/:id", Auth("admin", "product manager"), DeleteProduct);


ProductRouter.get( "/featured-products", FeaturedProducts);

ProductRouter.get("/trending-products", TrendingProducts);

ProductRouter.get("/new-arrivals", NewArrivals);

ProductRouter.get("/related-products/:id", RelatedProducts);

ProductRouter.get( "/product-analytics", Auth("admin", "inventory staff" ), ProductAnalytics);



module.exports = ProductRouter;