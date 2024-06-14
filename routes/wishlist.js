const express = require('express');
const router = express.Router();
const Wishlist = require('../models/wishlist');
const Product = require('../models/product');
const { isLoggedIn } = require('../middleware/mid');


router.get('/', isLoggedIn, async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    res.render('wishlist.ejs', { wishlist });
});


router.post('/add/:productId', isLoggedIn, async (req, res) => {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
    }

    res.redirect('/product');
});


router.post('/remove/:productId', isLoggedIn, async (req, res) => {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
        wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
        await wishlist.save();
    }

    res.redirect('/wishlist');
});

module.exports = router;
