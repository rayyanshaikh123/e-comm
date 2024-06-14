const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/mid');
const Product = require('../models/product');
const User = require('../models/user');
const Master = require('../models/master');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

router.get('/', async (req, res) => {
    const product = await Product.find({});
    res.render('product.ejs', { product });
});

router.get('/create', isLoggedIn, (req, res) => {
    res.render('create.ejs');
});

router.post('/create', async (req, res) => {
    const { title, description, photo, category, price, stockQuantity } = req.body;
    const userId = req.user._id;
    try {
        const newProduct = new Product({
            title,
            description,
            photo,
            price,
            category,
            stockQuantity,
            author: userId
        });
        await newProduct.save();
        const user = await User.findById(userId);
        user.products.push(newProduct._id);
        await user.save();
        res.redirect('/product');
    } catch (e) {
        if (e.code === 11000) {
            res.status(400).send('Duplicate key error: ' + JSON.stringify(e.keyValue));
        } else {
            res.status(500).send('An error occurred: ' + e.message);
        }
    }
});

router.get('/:id', isLoggedIn, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('author');
    res.render('show.ejs', { product });
});

router.get('/:id/edit', isLoggedIn, async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('update.ejs', { product });
});

router.patch('/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body);
    res.redirect('/product');
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
    } catch (e) {
        console.log('Error:', e);
    }
    res.redirect('/product');
});
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// New endpoint for adding products to masterdb
router.post('/master/add', async (req, res) => {
    const { category, title, description, image } = req.body;

    try {
        const newProduct = {
            category,
            mod: [{
                title,
                description,
                image
            }]
        };

        const savedProduct = await Master.create(newProduct);
        res.json(savedProduct);
    } catch (error) {
        console.error('Error adding product to MasterDB:', error);
        res.status(500).json({ error: 'Failed to add product to MasterDB' });
    }
});
router.get('/master/products', async (req, res) => {
    try {
        const products = await Master.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
