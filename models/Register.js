const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name:String,
    mail:String,
    password:String
})

const RegisterModel = mongoose.model("register",UserSchema)
module.exports = RegisterModel;