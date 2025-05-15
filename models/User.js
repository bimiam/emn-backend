// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    wpUserId: {
        type: Number,
        sparse: true
    },
    displayName: {
        type: String
    },
    contentCreated: { type: Number, default: 0 },
    estimatedEarnings: { type: Number, default: 0 },
    mistakes: { type: Number, default: 0 },
    contestPoints: { type: Number, default: 0 },
    monthlyContentTrend: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);