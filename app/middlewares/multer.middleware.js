const multer = require('multer');

// exports.createMulterMemoryMiddleware = ({
//   fieldName,
//   maxCount,
//   maxFileSizeMB
// }) => {
//   const storage = multer.memoryStorage();

//   const upload = multer({
//     storage,
//     limits: {
//       fileSize: maxFileSizeMB * 1024 * 1024, 
//       files: maxCount
//     }
//   });

//   return upload.array(fieldName, maxCount);
// };


// In your middleware creation function
exports.createMulterMemoryMiddleware = ({
  fieldName,
  maxCount,
  maxFileSizeMB
}) => {
  const storage = multer.memoryStorage();

  const upload = multer({
    storage,
    limits: {
      fileSize: maxFileSizeMB * 1024 * 1024, 
      files: maxCount
    }
  });

  return (req, res, next) => {
    console.log('Request headers:', req.headers);
    
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: err.message });
      }
      
      console.log('Files after multer:', req.files);
      next();
    });
  };
};

