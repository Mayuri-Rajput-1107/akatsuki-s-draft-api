const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, default: "", maxlength: 500 },
  content: { type: String, required: true },
  image: { type: String, default: "" },
  category: { type: String, default: "General", trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "rejected"],
    default: "draft"
  },
  rejectionReason: { type: String, default: "" },
  improvedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
