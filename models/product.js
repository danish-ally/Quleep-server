const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: {
    amount: { type: Number, required: true },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"],
      required: true,
    },
  },
  images: [
    {
      type: String,
      required: true,
      validate: [
        (val) => {
          return val.match(/\.(jpeg|jpg|gif|png)$/);
        },
        "Please upload an image with a valid extension (jpeg, jpg, gif, png)",
      ],
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
