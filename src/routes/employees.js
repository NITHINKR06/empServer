// routes/employeeRoutes.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const employeeController = require("../controller/employeeController");

// Configure Multer storage and ensure directory exists
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'Employee');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Define routes
router.get("/", employeeController.getEmployees);
router.post("/", employeeController.createEmployee);
router.get("/:id", employeeController.getEmployeeById);
router.put("/:id", upload.single("profilePhoto"), employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);
router.post("/:id/reviews", employeeController.addReview);

module.exports = router;
