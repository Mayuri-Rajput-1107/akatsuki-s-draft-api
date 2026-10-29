const Post = require("../models/Post");
const asyncHandler = require("../utils/asyncHandler");

const createPost = asyncHandler(async (req, res) => {
  const { title, description = "", content, image = "", category = "General", status = "draft" } = req.body;
  if (!title || !content) return res.status(400).json({ message: "title and content are required." });
  if (!["draft", "pending"].includes(status)) {
    return res.status(400).json({ message: "New posts can only be draft or pending." });
  }
  const post = await Post.create({
    title, description, content, image, category, status, createdBy: req.user._id
  });
  res.status(201).json({ message: "Post created.", post });
});

const listApproved = asyncHandler(async (_req, res) => {
  const posts = await Post.find({ status: "approved" })
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });
  res.json({ count: posts.length, posts });
});

const getApprovedById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: "approved" }).populate("createdBy", "name");
  if (!post) return res.status(404).json({ message: "Approved post not found." });
  res.json({ post });
});

const myPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ createdBy: req.user._id }).sort({ updatedAt: -1 });
  res.json({ count: posts.length, posts });
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (post.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only update your own posts." });
  }
  const allowed = ["title", "description", "content", "image", "category", "status"];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      if (key === "status" && !["draft", "pending"].includes(req.body.status)) {
        return res.status(400).json({ message: "Use the admin endpoints to approve or reject posts." });
      }
      post[key] = req.body[key];
    }
  }
  await post.save();
  res.json({ message: "Post updated.", post });
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (post.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only delete your own posts." });
  }
  await post.deleteOne();
  res.json({ message: "Post deleted." });
});

module.exports = { createPost, listApproved, getApprovedById, myPosts, updatePost, deletePost };
