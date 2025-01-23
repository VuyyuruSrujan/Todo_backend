const mongoose = require("mongoose");

const ToDoScheme = new mongoose.Schema({
    mail:String,
    todo_id:Number,
    title:String,
    description:String,
    currentTime:Date,
    dueDate:Date,
    todo_status:Boolean,
})

const ToDoModel = mongoose.model("todo",ToDoScheme);
module.exports = ToDoModel;