const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../middleware/mid');
const Product = require('../models/product');
const User = require('../models/user')
const methodOverride = require('method-override');

router.use(methodOverride('_method'))

router.get('/',async(req,res)=>{
const product = await Product.find({})
// console.log(Product)

    res.render('product.ejs',{product})
})

//create
router.get('/create',isLoggedIn,(req,res)=>{
    res.render('create.ejs')
})
router.post('/create', async(req,res)=>{
    const {title,description,photo,category,price,stockQuantity} = req.body;
    const userId = req.user._id; 
    try{
      
           console.log(req.user)
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
        console.log(req.user.username);
        const savedProduct = await newProduct.save();
        const user = await User.findById(userId);
        user.products.push(savedProduct._id);
        await user.save();

            res.redirect('/product')
    }catch(e){
        if (e.code === 11000) {
            res.status(400).send('Duplicate key error: ' + JSON.stringify(e.keyValue));
          } else {
            res.status(500).send('An error occurred: ' + e.message);
          }
    }
   
})



router.get('/:id',isLoggedIn,async(req,res)=>{
   
    const product = await Product.findById(req.params.id).populate('author');
    console.log(product)
    res.render('show.ejs',{product});
})


router.get('/:id/edit',isLoggedIn,async(req,res)=>{
    const product = await Product.findById(req.params.id);
    res.render('update.ejs', {product});
})

router.patch('/:id',isLoggedIn,async(req,res)=>{
    const {title,description,photo} = req.body;

    const {id} =  req.params;
    const foundProduct = await Product.findByIdAndUpdate(id ,req.body);
console.log(foundProduct)
   res.redirect('/product')
})


router.delete('/:id', async(req,res)=>{
    try{
    const {id} = req.params;
    const product = await Product.findByIdAndDelete(id);
  
}catch(e){
    console.log("Error!:",e);
}
    res.redirect('/product');
})



module.exports = router