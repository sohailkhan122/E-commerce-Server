const express = require('express')
const { getUserByIdController, forgotPasswordController, resetPasswordController, registerUser, loginUser, refreshTokenController, logoutUser, updateUserController, getAllUsersController, getCurrentUser } = require('../Controller/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshTokenController);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPasswordController);
router.put("/reset-password/:token", resetPasswordController);

// ================= PROTECTED ROUTES =================
router.get("/getalluser", protect, admin, getAllUsersController);
router.get("/current", protect, getCurrentUser);// Only admin can list all users
router.get("/:userId", protect, getUserByIdController); // Any logged-in user
router.put("/:userId", protect, updateUserController)

module.exports = router;    