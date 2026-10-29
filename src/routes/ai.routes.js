const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const { upload, improvePost } = require("../controllers/ai.controller");

router.post("/improve/:postId", protect, upload.single("file"), improvePost);

module.exports = router;
