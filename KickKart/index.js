import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const stripeGateway = stripe(process.env.STRIPE_API_KEY);

// Middleware
app.use(cors({
    origin: 'https://kick-kart-front.vercel.app',  // Allow requests from both localhost and your frontend on Vercel
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to Database"))
  .catch(err => console.error("Error in Connecting to Database:", err));

// Schemas and Models
const cartSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    products: [
        {
            productName: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            productImg: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            }
        }
    ]
});

const Cart = mongoose.model('Cart', cartSchema);

const buySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    products: [
        {
            productName: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            productImg: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            }
        }
    ],
    dateBought: { 
        type: Date, 
        default: Date.now 
    }
});

const Buy = mongoose.model('Buy', buySchema);

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.cookies.authToken || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// API Routes

// Fetch Cart Items
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const username = req.user.name; // or use req.user.email

        const userCart = await Cart.findOne({ username });
        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(userCart);
    } catch (error) {
        console.error('Error loading cart items:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add Items to Cart
app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        const username = req.user.name; // or use req.user.email
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const { cartItems } = req.body;

        // Check if the user already has a cart
        let userCart = await Cart.findOne({ username });

        if (userCart) {
            // If the user has an existing cart, update it
            cartItems.forEach(item => {
                const productIndex = userCart.products.findIndex(product => product.productName === item.title);

                if (productIndex > -1) {
                    // Update quantity if product already exists in the cart
                    userCart.products[productIndex].quantity += item.quantity;
                } else {
                    // Add new product to the cart
                    userCart.products.push({
                        productName: item.title,
                        price: item.price,
                        productImg: item.productImg,
                        quantity: item.quantity
                    });
                }
            });

            await userCart.save();
        } else {
            // If the user doesn't have a cart, create a new one
            const newCart = new Cart({
                username,
                products: cartItems.map(item => ({
                    productName: item.title,
                    price: item.price,
                    productImg: item.productImg,
                    quantity: item.quantity
                }))
            });

            await newCart.save();
        }

        res.status(201).json({ message: 'Cart updated successfully' });
    } catch (error) {
        console.error('Error adding items to cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Remove Item from Cart
app.delete('/api/cart/:productName', authenticateToken, async (req, res) => {
    try {
        const username = req.user.name; // or use req.user.email
        const { productName } = req.params;

        const userCart = await Cart.findOne({ username });

        if (userCart) {
            userCart.products = userCart.products.filter(product => product.productName !== productName);

            await userCart.save();

            res.status(200).json({ message: 'Product removed from cart' });
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Process Purchase
app.post('/api/buy', authenticateToken, async (req, res) => {
    try {
        const username = req.user.name; // or use req.user.email
        const { cartItems } = req.body;

        // Create a new purchase record
        const newPurchase = new Buy({
            username,
            products: cartItems.map(item => ({
                productName: item.title,
                price: item.price,
                productImg: item.productImg,
                quantity: item.quantity
            }))
        });

        await newPurchase.save();

        // Initiate Stripe Checkout
        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: cartItems.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.title,
                        images: [item.productImg],
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.BASE_URL}/payment`,
            cancel_url: `${process.env.BASE_URL}/cancel`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error processing purchase:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
