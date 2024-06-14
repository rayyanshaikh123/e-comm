const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/mid');
const Product = require('../models/product');
const User = require('../models/user');
const Master = require('../models/master');
const methodOverride = require('method-override');


router.post('/add', async (req, res) => {
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
router.get('/products', async (req, res) => {
    try {
        const products = await Master.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;