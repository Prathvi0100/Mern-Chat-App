const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//Schema
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    content: {
        type: String,
        trim: true,
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupModel"
    },
    isAdmin: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});


const Message = mongoose.model("Message", messageSchema);
module.exports = Message;