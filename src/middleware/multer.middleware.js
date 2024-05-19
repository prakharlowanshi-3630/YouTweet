import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //console.log("check the file for multer", file);
    //this return the field name file name type etc...
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // cb(null, file.fieldname + "-" + uniqueSuffix); we can also give by its fieldname
    cb(null, file.originalname); //name which is used by the author it will be on sever for few time because after some time will be uploaded on cloudinary
  },
});

export const upload = multer({ storage });