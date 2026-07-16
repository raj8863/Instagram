import multer from "multer";
const upload = multer({
    stronge:multer.memoryStorage(),
});
export default upload;