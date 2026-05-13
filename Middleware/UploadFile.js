import { CloudinaryStorage } from "multer-storage-cloudinary";
import  cloudinary  from "../Configs/CloudinaryConfig.js";
import multer from "multer";

const menuStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async(req , file)=>{
        return {
            folder: "menu_images",
            format:"png",
            public_id:`${file.originalname.split(".")[0]}-${Date.now()}`
        }
    }
})

export const uploadMenuStorage = multer({storage:menuStorage})