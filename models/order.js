const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}],
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered','Cancelled'],
    default: 'Pending'
  },
  payment: {
    orderId: {
      type: String,
      required: true
    },
    paymentId: {
      type: String,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
