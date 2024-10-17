import mongoose from "mongoose";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import customError from "../utils/customError.js";

export const createCategory = asyncWrapper(async (req, res, next) => {
  const { name, subCategories } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const category = new Category({ name });

    if (subCategories && subCategories.length > 0) {
      const subCategoriesData = subCategories.map((subCategory) => ({
        name: subCategory.name,
        category: category._id,
      }));

      const subCategoriesDoc = await SubCategory.insertMany(subCategoriesData, {
        session,
      });

      category.subCategories = subCategoriesDoc.map((subcategory) => subcategory._id);
    }

    await category.save();

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: 201,
      data: {
        category,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return next(error);
  }
});

export const updateCategory = asyncWrapper(async (req, res, next) => {
  const { categoryId } = req.params;
  const { name, subCategories } = req.body;

  const category = await Category.findById(categoryId).session(session);

  if (!category) {
    return next(customError.create("category are not found", 404, "not found"));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (name) {
      category.name = name;
    }

    if (subCategories) {
      const newSubCategoriesIds = [];
      const existingSubCategoryIds = category.subCategories.map((subCatId) =>
        subCatId.toString()
      );

      for (const subCategory of subCategories) {
        //    we can make it if the _id = "new" that means its new
        if (subCategory._id) {
          const subCategoryExists = existingSubCategoryIds.includes(subCategory._id);

          if (subCategoryExists) {
            await SubCategory.findByIdAndUpdate(
              subCategory._id,
              { name: subCategory.name },
              { session }
            );
          }

          newSubCategoriesIds.push(subCategory._id);
        } else {
          const newSubCategory = await SubCategory.create(
            [{ name: subCategory.name, category: category._id }],
            { session }
          );
          newSubCategoriesIds.push(newSubCategory[0]._id);
        }
      }

      const subCategoriesToRemove = existingSubCategoryIds.filter(
        (existingSubCategoryId) => !newSubCategoriesIds.includes(existingSubCategoryId)
      );

      if (subCategoriesToRemove.length > 0) {
        await SubCategory.deleteMany({ _id: { $in: subCategoriesToRemove } }).session(
          session
        );
      }

      category.subCategories = newSubCategoriesIds;
    }

    await category.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: 200,
      data: {
        category,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});

export const getAllCategories = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  const categories = await Category.find()
    .populate("subCategories")
    .limit(limit)
    .skip(skip);

  res.status(200).json({
    status: 200,
    data: {
      categories,
    },
  });
});

export const getCategory = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id).populate("subCategories");

  if (!category) {
    return next(customError.create("category are not found", 404, "not found"));
  }

  res.status(200).json({
    status: 200,
    data: {
      category,
    },
  });
});

export const deleteCategory = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    return next(customError.create("category are not found", 404, "not found"));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await SubCategory.deleteMany({ category: categoryId }).session(session);

    await Category.findByIdAndDelete(categoryId).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.status(204).json({
      status: 204,
      message: "category has been deleted",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return next(err);
  }
});
