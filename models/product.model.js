import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  brand: String,
  quantity: {
    type: Number,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  discountPrice: {
    type: Number,
  },
  discountExpiry: {
    type: Date,
  },

  images: [
    {
      type: String,
      required: true,
    },
  ],
  //   for different colors or sizes for the phone
  variants: [
    {
      variantType: String,
      value: String,
      priceAdjustment: Number,
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  seller: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  soldUnits: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [String],
});

productSchema.index({ price: -1, soldUnits: -1, category: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
