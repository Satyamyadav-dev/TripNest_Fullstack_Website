const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

// Add passport-local-mongoose plugin (it automatically handles username, hash & salt for passwords)
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);


