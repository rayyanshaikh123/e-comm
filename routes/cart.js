const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const { isLoggedIn } = require('../middleware/mid');


router.get('/', isLoggedIn, async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');
    res.render('cart.ejs', { cart, user:req.user._id });
});


router.post('/add/:productId', isLoggedIn, async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = new Cart({ user: req.user._id, products: [] });
    }

    const existingProductIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (existingProductIndex >= 0) {
        cart.products[existingProductIndex].quantity += parseInt(quantity, 10);
    } else {
        cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    res.redirect('/cart');
});


router.post('/update/:productId', isLoggedIn, async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (productIndex >= 0) {
            if (quantity <= 0) {
                cart.products.splice(productIndex, 1);
            } else {
                cart.products[productIndex].quantity = parseInt(quantity, 10);
            }
            await cart.save();
        }
    }

    res.redirect('/cart');
});


router.post('/remove/:productId', isLoggedIn, async (req, res) => {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.products = cart.products.filter(p => p.product.toString() !== productId);
        await cart.save();
    }

    res.redirect('/cart');
});

module.exports = router;
