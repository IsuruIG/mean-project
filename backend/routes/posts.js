const express = require('express');
const multer = require('multer');

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');


const router = express.Router();
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type!");
    if (isValid) {
      error = null;
    }
    callback(error, "backend/images"); // Path is relative to the server.js file.
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const extenion = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + extenion);
  }
});

router.post("", checkAuth, multer({storage: storage}).single("image"),
  (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({  // 201 - Ok added a new resource.
      message: 'Post added successfully.',
      post: {
        // id: createdPost._id,
        // title: createdPost.title,
        // content: createdPost.content,
        // imagePath: createdPost.imagePath - Old JS way

        ...createdPost, // netGen JS feature to copy all properties of a JS object.
        id: createdPost._id // netGen JS feature to override a property of the copied JS object.
      }
    });
  });
});

router.put("/:id", checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {  // Completely override the existing resource with the new values.
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename
  }
  const post = Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then(updatedPost => {
    if (updatedPost.nModified > 0) {
      res.status(200).json({ message: "Successully updated post!" });
    }
    else {
      res.status(401).json({ message: "Not authorized!" });
    }
  });
});
// app.patch(); // Only update the new values of the existing resource.


router.get("", (req, res, next) => {
  const pageSize = +req.query.pageSize; //req always returns a string so need to convert to number.
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize);
  }
  postQuery.then(documents => {
    fetchedPosts = documents;
      return Post.countDocuments();
    }).then(count => {
      res.status(200).json({
        message: 'Post fetched successfully!',
        posts: fetchedPosts,
        maxPosts: count
      });
    });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post)
    }
    else {
      res.status(400).json({ message: "Post not found!" })
    }
  });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(result => {
    if (result.n > 0) {
      res.status(200).json({ message: "Successully deleted post!" });
    }
    else {
      res.status(401).json({ message: "Not authorized!" });
    }
  });
});

module.exports = router;
