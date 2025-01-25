const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

//Hashing user password

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {  //this here represents current instance of doc Example: Raman  
        return next(); //move on to next middleware
    }
    this.password = await bcrypt.hash(this.password, 10);
});

//Method to compare password

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
};

const User = mongoose.model("User", userSchema);
module.exports = User;