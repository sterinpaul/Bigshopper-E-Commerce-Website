const multer = require('multer');

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/products')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
  

  const editedStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/products')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});


module.exports={
    uploads:multer({storage:Storage}).array('images',3),
    editeduploads:multer({storage:editedStorage}).fields([
        {name:'image1',maxCount:1},
        {name:'image2',maxCount:1},
        {name:'image3',maxCount:1}
    ])
}