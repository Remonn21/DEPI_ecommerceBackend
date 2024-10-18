import cloudinary from "../config/cloudinary.js";
import Category from "../models/category.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import customError from "../utils/customError.js";

export const getHomePageStatistics = asyncWrapper(async (req, res, next) => {
  const topSellingProducts = Product.find({
    isActive: true,
  })
    .populate({ path: "category", select: "name" })
    .sort({ soldUnits: -1 })
    .limit(10);

  const topRatedProducts = Product.find({ isActive: true })
    .populate({ path: "category", select: "name" })
    .sort({ rating: -1 })
    .limit(10);
  const [topSelling, topRated] = await Promise.all([
    topSellingProducts,
    topRatedProducts,
  ]);

  res.status(200).json({
    status: 200,
    data: {
      topSelling,
      topRated,
    },
  });
});

export const createProduct = asyncWrapper(async (req, res, next) => {
  const {
    name,
    brand,
    quantity,
    category_id,
    subCategory_id,
    price,
    description,
    discountPrice,
    discountExpiry,
    rating,
    isActive,
    soldUnits,
    details,
    tags,
  } = req.body;

  const imageUrls = req.files.map((file) => file.path);

  if (!imageUrls || imageUrls.length === 0) {
    return next(customError.create("Image is required", 400, "bad request"));
  }

  try {
    const category = await Category.findById(category_id).lean();

    if (!category) {
      return next(customError.create("category not found", 404, "not found"));
    }

    if (
      !category.subCategories.find(
        (subCategoryId) => String(subCategoryId) === subCategory_id
      )
    ) {
      return next(
        customError.create(
          "the selected sub category do not belong to the selected category",
          404,
          "not found"
        )
      );
    }
    if (discountPrice) {
      if (discountPrice > price || !(discountPrice > 0)) {
        return next(
          customError.create(
            "Discount price cant be more than the price or negative number ",
            400,
            "not found"
          )
        );
      }
    }
    const product = await Product.create({
      seller: req.currentUser.id,
      name,
      brand,
      quantity,
      discountPrice,
      discountExpiry: discountExpiry ? new Date(discountExpiry) : undefined,
      rating,
      isActive: isActive ? isActive : true,
      images: imageUrls,
      price,
      description,
      category: category_id,
      subCategory: subCategory_id,
      tags,
      soldUnits,
      details,
    });

    res.status(201).json({
      status: 201,
      data: {
        product,
      },
    });
  } catch (error) {
    if (imageUrls && imageUrls.length > 0) {
      await deleteImages(imageUrls);
    }
    next(error);
  }
});

export const updateProduct = asyncWrapper(async (req, res, next) => {
  const {
    name,
    brand,
    quantity,
    category_id,
    subCategory_id,
    price,
    description,
    discountPrice,
    discountExpiry,
    image_urls,
    rating,
    isActive,
    tags,
  } = req.body;

  const { productId } = req.params;
  const category = await Category.findById(category_id).lean().session(session);
  if (!category) {
    return next(customError.create("Category not found", 404, "not found"));
  }

  if (!category.subCategories.includes(subCategory_id)) {
    return next(
      customError.create(
        "The selected subcategory does not belong to the selected category",
        404,
        "not found"
      )
    );
  }

  if (discountPrice > price || !(discountPrice > 0)) {
    return next(
      customError.create(
        "Discount price can’t be more than the price or negative",
        400,
        "bad request"
      )
    );
  }

  const updatedFields = {};
  if (name) updatedFields.name = name;
  if (brand) updatedFields.brand = brand;
  if (quantity) updatedFields.quantity = quantity;
  if (category_id) updatedFields.category = category_id;
  if (subCategory_id) updatedFields.subCategories = subCategory_id;
  if (price) updatedFields.price = price;
  if (description) updatedFields.description = description;
  if (discountPrice) updatedFields.discountPrice = discountPrice;
  if (discountExpiry) updatedFields.discountExpiry = new Date(discountExpiry);
  if (image_urls) updatedFields.image_urls = image_urls;
  if (rating) updatedFields.rating = rating;
  if (typeof isActive !== "undefined") updatedFields.isActive = isActive;
  if (tags) updatedFields.tags = tags;

  // uplaod new images:
  let newImageUrls = [];
  if (req.files && req.files.length > 0) {
    newImageUrls = req.files.map((file) => file.path);
    updatedFields.images = newImageUrls;

    const imagesToDelete = product.images.filter(
      (oldImage) => !newImageUrls.includes(oldImage)
    );

    await deleteImages(imagesToDelete);
  }

  const product = await Product.findByIdAndUpdate(productId, updatedFields, {
    new: true,
    session,
    runValidators: true,
  });

  if (!product) {
    return next(customError.create("Product not found", 404, "not found"));
  }

  res.status(200).json({
    status: 200,
    data: {
      product,
    },
  });
});

export const deleteImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) return;

  try {
    await Promise.all(
      imageUrls.map(async (url) => {
        const publicId =
          url.split("/").slice(7, -1).join("/") +
          "/" +
          url.split("/").pop().split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      })
    );
  } catch (error) {
    console.error("Error deleting images:", error);
  }
};

export const getAllProducts = asyncWrapper(async (req, res, next) => {
  const searchQuery = req.query.searchQuery || "";
  const sortOption = req.query.sortOption || "soldUnits";
  let sortOrder = req.query.sortOrder || "desc";
  const category = req.query.category;
  const subCategory_id = req.query.subCategory;

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const query = {};

  if (searchQuery) {
    query["name"] = new RegExp(searchQuery, "i");
  }
  if (category) {
    const categoryReg = new RegExp(category, "i");
    const categoryDoc = await Category.findOne({ name: categoryReg }).select("name");
    if (!categoryDoc)
      return next(customError.create("Category not found", 404, "not found"));
    query["category"] = categoryDoc.id;
  }
  // if (subCategory_id) {
  //   query["category"] = category;
  // }

  sortOrder = sortOrder === "desc" ? -1 : 1;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ [sortOption]: sortOrder })
      .limit(limit)
      .skip(skip)
      .lean(),
    Product.countDocuments(query),
  ]);

  res.json({
    status: 200,
    data: products,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const [product, orderDoc] = await Promise.all([
    Product.findById(id).populate("reviews").lean(),
    req.currentUser
      ? Order.countDocuments({
          user: req.currentUser.id,
          products: { $elemMatch: { product: id } },
        })
      : undefined,
  ]);
  if (!product) {
    return next(customError.create("Product not found", 404, "not found"));
  }
  res.status(200).json({
    status: 200,
    data: {
      product: { ...product, orderedByUser: !!orderDoc },
    },
  });
});
