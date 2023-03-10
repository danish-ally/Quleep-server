const router = require("express").Router();

const productRoutes = require("./product");

// productRoutes
router.use("/product", productRoutes);

module.exports = router;
