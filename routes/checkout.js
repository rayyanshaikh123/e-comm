const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const { isLoggedIn } = require('../middleware/mid');


router.get('/success',(req,res)=>{
    
    res.render('checkout-success.ejs');
})
router.get('/cancel',(req,res)=>{
    res.render('checkout-fail.ejs');
})



module.exports = router;