const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: String,
    _id: String,
    log: [{
        description: String,
        duration: Number,
        date: Date
    }],
    count: Number
})

module.exports = mongoose.model("Users", userSchema)