const express = require('express')
const { registerController, loginController, updateUser, getUserByIdController, getAllUsers, forgotPasswordController, resetPasswordController } = require('../Controller/userController')

const Router = express.Router();

Router.post('/login', loginController);
Router.post('/register', registerController);
Router.put('/updateUser/:userId', updateUser);
Router.get('/getUserById/:userId', getUserByIdController);
Router.get('/getAllUsers', getAllUsers)
Router.post("/forgot-password", forgotPasswordController);
Router.put("/reset-password/:token", resetPasswordController);

module.exports = Router;    