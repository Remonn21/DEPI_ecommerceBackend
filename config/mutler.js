import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    transformation: [{ width: 500, height: 500, crop: "limit", quality: "auto" }],
    public_id: (req, file) => "product-" + Date.now(),
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      customError.create("Not an image! Please upload only images!", 400, "bad request"),
      false
    );
  }
};

const uploadProductImg = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: multerFilter,
});

export default uploadProductImg;
