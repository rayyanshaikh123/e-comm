const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Cart = require('../models/cart');
const Order = require('../models/order');
const User = require('../models/user');


const { isLoggedIn } = require('../middleware/mid');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post('/create-order', isLoggedIn, async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');
    if (!cart || cart.products.length === 0) {
        return res.status(400).send('No items in cart');
    }

    const totalPrice = cart.products.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    const options = {
        amount: totalPrice * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send('Error creating order');
    }
});

router.post('/verify-payment', isLoggedIn, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
        try {
            // Find cart
            const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');
            console.log(cart)

            // Create order
            const orderProducts = cart.products.map(item => ({
                product: item.product,
                quantity: item.quantity
            }));
            const order = new Order({
                user: req.user._id,
                products: orderProducts,
                totalPrice: cart.totalPrice,
                payment: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id
                }
            });
            
          
            await order.save();
            const savedProduct = await order.save();
            const user = await User.findById(req.user._id);
            user.orders.push(savedProduct._id);
            await user.save();
            
            await Cart.findOneAndDelete({ user: req.user._id });

            res.json({ status: 'success' });
        } catch (error) {
            console.error('Error processing payment:', error);
            res.status(500).send('Error processing payment');
        }
    } else {
        res.status(400).json({ status: 'failure' });
    }
});


// router.post('/orders/cancel-order', isLoggedIn, async (req, res) => {
//     const { orderId } = req.body;

//     try {
//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).send('Order not found');
//         }

//         if (order.user.toString() !== req.user._id.toString()) {
//             return res.status(403).send('Unauthorized');
//         }

//         // Proceed with refund
//         const refund = await razorpay.payments.refund(order.payment.paymentId, {
//             amount: order.products.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) * 100
//         });

//         order.status = 'Cancelled';
//         order.payment.refundId = refund.id;
//         await order.save();

//         res.json({ status: 'success' });
//     } catch (error) {
//         console.error('Error cancelling order:', error);
//         res.status(500).send('Error cancelling order');
//     }
// });

module.exports = router;
