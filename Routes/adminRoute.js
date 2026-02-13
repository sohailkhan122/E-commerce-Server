const express = require('express')
const { createAdmin, loginAdmin } = require('../Controller/adminController')

const Router = express.Router();

Router.post('/createAdmin', createAdmin);
Router.post('/loginAdmin', loginAdmin);

module.exports = Router;    