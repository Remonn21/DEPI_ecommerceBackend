import customError from "../utils/customError.js";
import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
   const authHeader =
      req.headers["Authorization"] || req.headers["authorization"];

   if (!authHeader) {
      const error = customError.create("token is required", 401, "ERROR");
      return next(error);
   }

   const token = authHeader.split(" ")[1];
   try {
      const currentUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.currentUser = currentUser;
      next();
   } catch (err) {
      const error = customError.create("invalid token", 401, "ERROR");
      return next(error);
   }
};