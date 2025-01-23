const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const app = express()
app.use(express.json())
app.use(cors())
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const RegisterModel = require('./models/Register');
const ToDoModel = require('./models/Todo');

mongoose.connect("mongodb://127.0.0.1:27017/srujan");

app.post('/register',(req , res)=>{
    const {name , mail , password } = req.body;
    if(mail){
        RegisterModel.findOne({mail})
        .then(result=>{
            if(result){
                if(result.mail == mail){
                    res.status(200).json("user already exists");
                }
            }else{
                RegisterModel.create({name , mail , password})
                .then(result =>{
                    console.log("user registered successfully:",result);
                    res.status(200).json("Registered successfully");
                })
                .catch(err =>{
                    console.log("error",err);
                    res.status(500).json(err);
                });
            }
        })
    }
});

app.post('/Login', (req, res) => {
    const { mail, password } = req.body;
    RegisterModel.findOne({ mail: mail })
        .then(user => {
            if (user) {
                if (user.mail == mail && user.password === password) {
                    const token = jwt.sign({ mail: user.mail }, SECRET_KEY, { expiresIn: "1h" });
                    res.status(200).json({ token });
                } else {
                    res.status(401).json({ message: "Password is incorrect" });
                }
            } else {
                res.status(402).json({ message: "You are not registered" });
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Internal Server Error", err });
        });
});

app.post('/check_mail',(req , res) =>{
    // console.log('Request body:', req.body);
    const {mail} = req.body;
    RegisterModel.findOne({mail})
    .then(result =>{
        if(result){
            if(result.mail == mail){
                res.status(200).json({message:"user exist"});
            }else{
                res.status(402).json("you are not registered");
            }
        }else{
            res.status(400).json("user doesn't exist");
        }
    })
    .catch(error =>{
        console.log(error);
        res.status(500).json(error);
    })
})



const SECRET_KEY = "Vuyyu*@03";

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'srujan9063@gmail.com',
        pass: 'alun aako xknx mgnv'
    }
});

app.post('/sendOTP', (req, res) => {
    const { mail } = req.body;

    // Generate a 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(`Generated OTP: ${otp}`);

    // Send mail with OTP
    const mailOptions = {
        from: 'srujan.vuyyuru1@gmail.com',
        to: mail,
        subject: 'Reset Password Here',
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending OTP:', error);
            res.status(500).json({ message: 'Failed to send OTP', error });
        } else {
            console.log('OTP sent: ' + info.response);
            res.status(200).json({ message: 'OTP sent successfully', otp });
        }
    });
});

app.post('/reset_register',(req , res)=>{
    const {mail , password} = req.body;
    RegisterModel.updateOne({ mail },{$set: {password}})
    .then(result =>{
        if(result.modifiedCount>0){
        console.log("User updated:",result);
        res.status(200).json({message:"user details updated successfully"});
        }else{
            console.log("No matching user found");
            res.status(400).json({ message: 'User not found' });
        }
    })
    .catch(err=> res.json(err));
});

app.get('/api/current-time', (req, res) => {
    const currentTime = new Date();
    res.json({ currentTime });
});

var todo_id = 1;

app.post("/todolist", (req,res)=>{
    const currentTime = new Date();
    const todo_status = false;
    const {mail,title,description,dueDate} = req.body;
    ToDoModel.create({mail ,todo_id ,title,description,currentTime,dueDate , todo_status})
    .then(result =>{
        console.log("created successfully",result);
        todo_id+=1;
        res.status(200).json({
            message: "Created successfully",
            data: result,
          });
    })
    .catch(error =>{
        res.status(400).json({
            message: "Invalid input",
          });
        console.log("error",error);
    })
})


app.get('/my_tasks/:mail',(req , res)=>{
    const {mail} = req.params;
    ToDoModel.find({mail})
    .then((tasks) => {
        if(tasks.length >= 0){
            res.status(200).json({
                message:"Tasks retrieved successfully",
                data:tasks,
            })
        } else{
            res.status(404).json({
                message: "No tasks found for the provided mail",
            })
        }
    })
    .catch((error) =>{
        console.error("Error fetching tasks:", error);
        res.status(500).json({
          message: "An error occurred while fetching tasks",
        });
    })
});

app.post('/update_status', (req, res) => {
    const { todo_id } = req.body;
    console.log("Received todo_id:", todo_id);
    if (!todo_id) {
        return res.status(400).json({ message: "todo_id is required" });
    }
    ToDoModel.findOne({ todo_id })
        .then((task) => {
            if (task) {
                const newStatus = !task.todo_status;
                ToDoModel.updateOne({ todo_id }, { $set: { todo_status: newStatus } })
                    .then(() => {
                        res.status(200).json({
                            message: "Task status updated successfully",
                            data: { todo_id, newStatus },
                        });
                    })
                    .catch((error) => {
                        console.error("Error updating task status:", error);
                        res.status(500).json({ message: "An error occurred while updating task status" });
                    });
            } else {
                res.status(404).json({ message: "Task not found" });
            }
        })
        .catch((error) => {
            console.error("Error finding task:", error);
            res.status(500).json({ message: "An error occurred while finding the task" });
        });
});

app.post('/delete_task', (req, res) => {
    const { todo_id } = req.body;
    console.log("Received todo_id for deletion:", todo_id);

    if (!todo_id) {
        return res.status(400).json({ message: "todo_id is required" });
    }

    ToDoModel.deleteOne({ todo_id })
        .then((result) => {
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: "Task deleted successfully",
                    data: { todo_id },
                });
            } else {
                res.status(404).json({ message: "Task not found" });
            }
        })
        .catch((error) => {
            console.error("Error deleting task:", error);
            res.status(500).json({ message: "An error occurred while deleting the task" });
        });
});


app.post('/update_todo', (req, res) => {
    const { todo_id , title , description , dueDate } = req.body;
    console.log("Received todo_id:", todo_id);
    if (!todo_id) {
        return res.status(400).json({ message: "todo_id is required" });
    }
    ToDoModel.findOne({ todo_id })
        .then((task) => {
            if (task) {
                ToDoModel.updateOne({ todo_id }, { $set: { title ,description ,dueDate } })
                    .then(() => {
                        res.status(200).json({
                            message: "Task  updated successfully",
                            data: { todo_id , title ,description ,dueDate },
                        });
                    })
                    .catch((error) => {
                        console.error("Error updating task:", error);
                        res.status(500).json({ message: "An error occurred while updating task" });
                    });
            } else {
                res.status(404).json({ message: "Task not found" });
            }
        })
        .catch((error) => {
            console.error("Error finding task:", error);
            res.status(500).json({ message: "An error occurred while finding the task" });
        });
});


app.listen(5001, () => {
    console.log("Server is running on port 5001");
});