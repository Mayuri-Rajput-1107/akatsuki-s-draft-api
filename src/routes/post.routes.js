const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const {
  createPost, listApproved, getApprovedById, myPosts, updatePost, deletePost
} = require("../controllers/post.controller");

router.get("/", listApproved);
router.get("/my-posts", protect, myPosts);
router.get("/:id", getApprovedById);
router.post("/", protect, createPost);
router.patch("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
