const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, required: true },
    googleId: { type: String, unique: true, sparse: true }, 
    displayName: String,
    photo: String,
    isVerified: { type: Boolean, default: false },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]

}, { timestamps: true });

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
