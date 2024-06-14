const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  photo: String,

  price: {
    type: Number,
    required: true,
    min: 0
},
category: {
  type: String,
  required: true
},
stockQuantity: {
  type: Number,
  required: true,
  min: 0
},

author: {
  type: Schema.Types.ObjectId,
  ref: 'User'
}
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
