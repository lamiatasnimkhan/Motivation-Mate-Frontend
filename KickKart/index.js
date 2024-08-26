import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";
import path from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const stripeGateway = stripe(process.env.STRIPE_API_KEY);

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());  // To parse cookies from the request
const PORT = process.env.PORT || 3000;
// Connect to the MongoDB database
mongoose.connect('mongodb://localhost:27017/e-commerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));

const productSchema = new mongoose.Schema({
    title: String,
    imageUrl: String,
    price: Number,
    category: String
});

const Product = mongoose.model('Product', productSchema);

const productfSchema = new mongoose.Schema({
    title: String,
    imageUrl: String,
    price: Number,
    category: String
});

const Productf = mongoose.model('Productf', productfSchema);
const productnSchema = new mongoose.Schema({
    title: String,
    imageUrl: String,
    price: Number,
    category: String
});

const Productn = mongoose.model('Productn', productnSchema);
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

// Routes
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.get("/men", (req, res) => {
    res.sendFile("men.html", { root: "public" });
});

app.get("/women", (req, res) => {
    res.sendFile("women.html", { root: "public" });
});

app.get("/new", (req, res) => {
    res.sendFile("new.html", { root: "public" });
});

app.get("/payment", (req, res) => {
    res.sendFile("payment.html", { root: "public" });
});

app.get("/cancel", (req, res) => {
    res.sendFile("cancel.html", { root: "public" });
});

// User Sign-Up Route
app.post('/sign_up', async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const data = { name, email, username, password: hashedPassword };

        await db.collection('registers').insertOne(data);
        console.log("Record Inserted Successfully");

        return res.redirect('index.html');
    } catch (err) {
        console.log("Error during sign-up:", err);
        return res.status(500).json({ error: "Sign-up failed" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.collection('registers').findOne({ email });
        console.log("User found:", user);

        if (user) {
            if (password === user.password) {
                console.log("Password matches");
                const token = jwt.sign(
                    { id: user._id, name: user.name, email: user.email, username: user.username },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                res.cookie('authToken', token, { httpOnly: true });
                return res.redirect('index.html');
            } else {
                console.log("Password doesn't match");
                return res.status(400).json({ error: "Password doesn't match" });
            }
        } else {
            console.log("User doesn't exist");
            return res.status(400).json({ error: "User doesn't exist" });
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ error: "Login failed" });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    return res.redirect('index.html');
});

// Middleware to authenticate token
// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.cookies.authToken || req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}


app.get('/someProtectedRoute', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

app.get('/getUser', authenticateToken, (req, res) => {
    res.json({ name: req.user.name, email: req.user.email });
});

// API routes to fetch products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

app.get('/api/productsf', async (req, res) => {
    try {
        const productsf = await Productf.find();
        res.json(productsf);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

app.get('/api/productsn', async (req, res) => {
    try {
        const productsn = await Productn.find();
        res.json(productsn);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Error fetching products' });
    }
});
// GET route to retrieve cart items
app.get('/api/cart', authenticateToken, async (req, res) => {
    console.log('GET /api/cart route hit'); // Debug log
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

app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const username = req.user.name; // or req.user.email if you prefer
        const orders = await Buy.find({ username }); // Find all orders for the authenticated user

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// POST route for adding to cart
app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        const username = req.user.name; // or use req.user.email if you prefer
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

        res.status(201).json({ message: 'Cart items saved successfully' });
    } catch (error) {
        console.error('Error saving cart items:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE route to remove item from the cart
app.delete('/api/cart/:productName', authenticateToken, async (req, res) => {
    try {
        const username = req.user.name; // or req.user.email if you prefer
        const { productName } = req.params;

        if (!username || !productName) {
            return res.status(400).json({ message: 'Username and productName are required' });
        }

        // Find the user's cart
        const userCart = await Cart.findOne({ username });

        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove the item from the cart
        userCart.products = userCart.products.filter(product => product.productName !== productName);

        if (userCart.products.length === 0) {
            // Optionally, delete the cart if it's empty
            await Cart.deleteOne({ username });
        } else {
            await userCart.save();
        }

        res.status(200).json({ message: 'Cart item removed successfully' });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/api/buy', authenticateToken, async (req, res) => {
    try {
        const username = req.user.name; // or req.user.email if preferred
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const { cartItems } = req.body;

        // Check if cartItems is an array and has items
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ message: 'No items provided for purchase' });
        }

        // Create a new buy entry for the user
        const newBuy = new Buy({
            username,
            products: cartItems.map(item => ({
                productName: item.title,
                price: item.price,
                productImg: item.productImg,
                quantity: item.quantity
            }))
        });

        await newBuy.save();

        // Optionally, clear the user's cart after successful purchase
        await Cart.deleteOne({ username });

        res.status(201).json({ message: 'Purchase recorded successfully' });
    } catch (error) {
        console.error('Error recording purchase:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// Stripe Checkout Route
app.post('/stripe-checkout', async (req, res) => {
    try {
        const lineItems = req.body.items.map((item) => {
            const unitAmount = parseInt(item.price.toFixed(2) * 100);
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.title,
                        images: [item.imageUrl],
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });

        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${req.headers.origin}/payment.html`,
            cancel_url: `${req.headers.origin}/cancel.html`,
            line_items: lineItems,
            billing_address_collection: "required",
        });

        res.json({ url: session.url });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});

