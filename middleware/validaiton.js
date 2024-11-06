import { body, validationResult, query } from "express-validator";

const handleValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateGetProductsQueryParmaters = [
  query("searchQuery").optional().isString().withMessage("Search query must be a string"),
  query("sortOption").optional().isString().withMessage("Sort option must be a string"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("search results limit must be a positive integer"),
  handleValidationErrors,
];

export const validateLoginInputs = [
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password").isLength({ min: 1 }).withMessage("Password is required"),
  handleValidationErrors,
];

export const validateRegisterInputs = [
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("name")
    .isLength({ min: 4 })
    .withMessage("name must be at least 4 characters long"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

export const validateReviewInputs = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be a number between 1 and 5"),
  body("comment").isLength({ min: 1 }).withMessage("Comment is required"),
  handleValidationErrors,
];
