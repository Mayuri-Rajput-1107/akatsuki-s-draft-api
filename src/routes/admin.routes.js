const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth.middleware");
const { pendingPosts, approvePost, rejectPost } = require("../controllers/admin.controller");

router.use(protect, adminOnly);
router.get("/pending", pendingPosts);
router.patch("/approve/:id", approvePost);
router.patch("/reject/:id", rejectPost);

module.exports = router;
