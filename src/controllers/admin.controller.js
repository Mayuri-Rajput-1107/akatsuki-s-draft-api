const Post = require("../models/Post");
const asyncHandler = require("../utils/asyncHandler");

const pendingPosts = asyncHandler(async (_req, res) => {
  const posts = await Post.find({ status: "pending" }).populate("createdBy", "name email").sort({ createdAt: 1 });
  res.json({ count: posts.length, posts });
});

const approvePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  post.status = "approved";
  post.rejectionReason = "";
  await post.save();
  res.json({ message: "Post approved and now public.", post });
});

const rejectPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  post.status = "rejected";
  post.rejectionReason = String(req.body.reason || "No reason provided").slice(0, 500);
  await post.save();
  res.json({ message: "Post rejected.", post });
});

module.exports = { pendingPosts, approvePost, rejectPost };
