const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid");
const Product = require("../../models/product");

// Load your AWS credentials from environment variables or configuration file
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Set up S3 bucket and region
const s3 = new AWS.S3({ region: process.env.AWS_REGION });
const S3_BUCKET_NAME = process.env.AWS_BUCKET;

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and GIF images are allowed"));
    }
    cb(null, true);
  },
});

// API endpoint for adding a product
router.post("/", upload.array("images", 6), async (req, res) => {
  try {
    // Create a new product with data from the request body
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: {
        amount: req.body.price.amount,
        currency: req.body.price.currency,
      },
      images: [],
    });

    // Loop through the uploaded files and upload each one to S3
    for (const file of req.files) {
      const filename = `${uuid.v4()}-${file.originalname}`;
      const params = {
        Bucket: S3_BUCKET_NAME,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const uploadedFile = await s3.upload(params).promise();

      // Add the S3 URL to the images array of the product
      product.images.push(uploadedFile.Location);
    }

    // Save the product to the database
    await product.save();

    res
      .status(201)
      .json({ message: "Product added successfully", product: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// API endpoint to retrieve all products
router.get("/", async (req, res) => {
  try {
    // Retrieve all products from the database
    const products = await Product.find();

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
