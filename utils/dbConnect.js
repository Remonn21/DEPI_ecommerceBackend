import mongoose from "mongoose";

export const connectToDb = () => {
   mongoose
      .connect(process.env.MONGODB_CONNECTION)
      .then(() => {
         console.log("connected to database!");
      })
      .catch((error) => {
         console.log("Error connecting to database:", error);
      });
};
