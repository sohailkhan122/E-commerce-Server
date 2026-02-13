const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userModel = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
  },
  region: {
    type: String,
  },
  companyname: {
    type: String,
  },
  streetadress: {
    type: String,
    default: null
  },
  unit: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  phone: {
    type: String,
  },
  postalcode: {
    type: String,
  },
  deliveryinstruction: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpire: {
    type: Date,
    required: false,
  },

});


userModel.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userModel.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const UserModel = mongoose.model('e_commerce_user', userModel);

module.exports = UserModel;
