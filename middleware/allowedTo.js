import customError from "../utils/customError.js";

export const allowedTo = (...roles) => {
   return (req, res, next) => {
      if (!roles.includes(req.currentUser.role))
         return next(customError.create("this role is not authorized", 401));

      next();
   };
};
