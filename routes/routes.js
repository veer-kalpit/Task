const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const path = require("path");
const { title } = require("process");
const fs = require("fs");
const { type } = require("os");

// image Upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// insert an user into database
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const image = req.file ? req.file.filename : null;
    console.log("User", req.body);
    console.log("Uploaded Image:", image);
    const user = new User({ name, email, phone, image });

    // Save the user to the date abase
    await user.save();

    // Set success message and redirect
    req.session.message = {
      type: "success",
      message: "User Added Successfully!",
    };
    res.redirect("/");
  } catch (err) {
    // Handle errors
    res.json({ message: err.message, type: "danger" });
  }
});

// Get all users route
router.get("/", async (req, res) => {
  try {
    const users = await User.find().exec();
    res.render("index", {
      title: "homepage",
      users: users,
    });
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

// edit an user
router.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      res.redirect("/");
    } else {
      res.render("edit_users", {
        title: "Edit Users",
        user: user,
      });
    }
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Update
// Setup multer for file uploads

router.post("/update/:id", upload.single("image"), async (req, res) => {
  let id = req.params.id;
  let new_image = req.body.old_image || "";

  if (req.file) {
    new_image = req.file.filename;
    fs.unlink(path.join(__dirname, "uploads", req.body.old_image), (err) => {
      if (err) {
        console.log("Error deleting old image:", err);
      }
    });
  }

  try {
    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });

    req.session.message = {
      type: "success",
      message: "User Updated Successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.status(400).json({ message: err.message, type: "danger" });
  }
});

// Delete

router.get("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the user by ID
    const result = await User.findByIdAndDelete(id);

    if (result && result.image) {
      // Define the path to the image file
      const imagePath = path.join(__dirname, "..", "uploads", result.image);

      // Check if the file exists and delete it
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    req.session.message = {
      type: "info",
      message: "User Deleted Successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router;
