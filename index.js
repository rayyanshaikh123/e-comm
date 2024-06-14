const express = require('express');
const app = express();
const path = require('path');
const passport = require('passport');
const statergy = require('passport-local');
const session = require('express-session');
const User = require('./models/user');
const Order = require('./models/order');
const Product = require('./models/product');

const  mongoose = require('mongoose');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const {isLoggedIn} = require('./middleware/mid')
require("dotenv").config();

mongoose.connect('mongodb://localhost:27017/pass')
.then(()=>{
    console.log("MongoDB Connected!");
})
.catch(()=>{
    console.log('Error!')
});



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));




app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(session({secret:'BHAHAH', resave:false, saveUninitialized: true}));
app.use((req,res,next)=>{
    // console.log(req.session)
        next();
    })
    app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

console.log(process.env.GOOGLE_CLIENT_ID);
console.log(process.env.GOOGLE_CLIENT_SECRET);

passport.use(new statergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({ 
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",

  },
  async(accessToken, refreshToken, profile, done) => {
    try{
// console.log(profile)
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
            console.log('User Already exists')
        }
        const newUser = await User.create({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value,
          isVerified: profile.verified
        });
        await newUser.save();
        done(null, newUser);
    }catch(e){
        console.log('Error:',e)
    }
 
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
app.use('/product', require('./routes/product'));
app.use('/wishlist', require('./routes/wishlist'));
app.use('/cart', require('./routes/cart'));
app.use('/payment', require('./routes/payment'));
app.use('/checkout', require('./routes/checkout'));









// const isLoggedIn = (req,res,next)=>{
//     if(!req.isAuthenticated()){
//         // req.session.returnTo = req.originalUrl;
//        return res.redirect('/login');
        
//     }
//     next();
// }

app.get('/register',(req,res)=>{
    res.render('register.ejs'); 
})
app.post('/register/save', async(req,res)=>{
    try{
        const {email,username,password} = req.body;
        const user =  new User({email,username});
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
    console.log("User Already exists")
      return res.redirect('/register');
    }
        const newUser = await User.register(user,password)
    //   await newUser.save();
    req.login(newUser, err =>{
        if(err) return next(err);
        res.redirect('/');
    })

      
    }catch(e){
              
        res.redirect('/register');
    }
    
})

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/auth/failure'
}));
app.get('/auth/failure', (req,res)=>{
    res.redirect('/login')
})
app.get('/login', (req,res)=>{
    res.render('login.ejs');
})
app.post('/login/save', passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}) ,(req,res)=>{
// console.log(req.user)


 res.redirect('/');

    
})


app.get('/logout',(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
      });
    // res.redirect('/login');
})






app.get('/', (req,res)=>{

    res.render('index.ejs' ,{currentUser: req.user});
})
app.get('/post', isLoggedIn,(req,res)=>{
console.log(req.user)
    res.render('post.ejs' ,{currentUser: req.user});
    
})

app.get('/profile', isLoggedIn,(req,res)=>{
    console.log(req.user)
        res.render('profile.ejs' ,{currentUser: req.user});
        
    })

    app.get('/profile/:id', isLoggedIn,async(req,res)=>{
        const {id} = req.params;
// const user  =  await User.findById(id).populate('orders');
const orders = await Order.find({user: id}).populate('products.product')
        console.log(orders)
            res.render('order.ejs' ,{user:req.user,orders});
          
        })




        app.get('/profile/product/:id', isLoggedIn,async(req,res)=>{
            const {id} = req.params;
            const product = await Product.find({author: id });
            // console.log(product)
            res.render('profile-product.ejs',{product})
        })
app.listen(3000,()=>{

    console.log("Listening to port 3000");
})