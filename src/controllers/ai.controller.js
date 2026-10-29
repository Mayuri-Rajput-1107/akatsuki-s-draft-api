const fs = require("fs/promises");
const path = require("path");
const { GoogleGenAI, createUserContent, createPartFromUri } = require("@google/genai");
const multer = require("multer");
const Post = require("../models/Post");
const asyncHandler = require("../utils/asyncHandler");

const upload = multer({
  dest: path.join(process.cwd(), "uploads"),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf", "text/plain", "text/markdown",
      "image/png", "image/jpeg", "image/webp"
    ];
    cb(allowed.includes(file.mimetype) ? null : new Error("Allowed file types: PDF, TXT, Markdown, PNG, JPG, WEBP."), allowed.includes(file.mimetype));
  }
});

const improvePost = asyncHandler(async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: "AI is not configured. Add GEMINI_API_KEY to .env." });
  }
  const original = await Post.findById(req.params.postId);
  if (!original) return res.status(404).json({ message: "Post not found." });
  if (original.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only improve your own posts." });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Improve the writing of this content while preserving its meaning, facts, and author's voice. Do not invent facts. Return ONLY valid JSON with keys "title", "description", and "content". Keep the content in the same language.\\n\\nTitle: ${original.title}\\nDescription: ${original.description}\\nContent:\\n${original.content}`;
  let parts = [{ text: prompt }];
  let uploadedFileName;

  try {
    if (req.file) {
      const uploaded = await ai.files.upload({
        file: req.file.path,
        config: { mimeType: req.file.mimetype, displayName: req.file.originalname }
      });
      uploadedFileName = uploaded.name;
      parts.push(createPartFromUri(uploaded.uri, uploaded.mimeType));
      parts[0].text += "\\nUse the attached file as additional source material. Do not invent facts.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent(parts),
      config: { responseMimeType: "application/json" }
    });

    let improved;
    try {
      improved = JSON.parse(response.text);
    } catch (_parseError) {
      return res.status(502).json({ message: "AI returned an unexpected format. Please retry." });
    }
    if (!improved.title || !improved.content) {
      return res.status(502).json({ message: "AI response is missing title or content. Please retry." });
    }

    const newDraft = await Post.create({
      title: String(improved.title).slice(0, 180),
      description: String(improved.description || "").slice(0, 500),
      content: String(improved.content),
      image: original.image,
      category: original.category,
      createdBy: original.createdBy,
      status: "draft",
      improvedFrom: original._id
    });
    res.status(201).json({
      message: "Improved version saved as a new draft. Original post remains unchanged.",
      originalPostId: original._id,
      improvedDraft: newDraft
    });
  } finally {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    // Gemini files may be retained by the provider until deleted/expired. Delete the uploaded
    // temporary provider file when possible; this does not affect the saved post.
    if (uploadedFileName) {
      await ai.files.delete({ name: uploadedFileName }).catch(() => {});
    }
  }
});

module.exports = { upload, improvePost };
