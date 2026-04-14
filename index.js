const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());
app.use('/images', express.static('images'));

// ✅ Home route
app.get('/', (req, res) => {
    res.send("Server is running 🚀");
});

// ✅ Register API (ADD HERE)


app.post('/register', (req, res) => {
    // We pull name, email, and password (matching your table columns)
    const { name, email, password } = req.body;
    const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(query, [name, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Email already exists or Database error" });
        }
        res.json({ success: true, message: "User registered!", userId: result.insertId });
    });
});


// ✅ Start server (ALWAYS KEEP AT BOTTOM)
app.listen(5000, () => {
    console.log("Server running on port 5000");
});




// Login Route - Updated to match your 'users' table
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // ADD THIS LINE TO DEBUG
    console.log("Login Attempt:", email, password);

    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(query, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            res.json({ success: true, user: { name: results[0].name } });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    });
});
// Add a new category
app.post('/categories', (req, res) => {
    const { category_name } = req.body;
    const sql = "INSERT INTO categories (category_name) VALUES (?)";

    db.query(sql, [category_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Category created! ✅", categoryId: result.insertId });
    });
});


// Add a new product
app.post('/products', (req, res) => {
    const { name, description, price, stock, category_id, image } = req.body;
    
    const sql = `INSERT INTO products (name, description, price, stock, category_id, image) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [name, description, price, stock, category_id, image], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product added to shop! 📦", productId: result.insertId });
    });
});


// Get all products with their category names
app.get('/products', (req, res) => {
    const sql = `
        SELECT p.*, c.category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.category_id`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/add-to-cart', (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    // 1. Check if a cart exists for this user
    const findCartSql = "SELECT cart_id FROM cart WHERE user_id = ?";
    
    db.query(findCartSql, [user_id], (err, cartResult) => {
        if (err) return res.status(500).json(err);

        let cart_id;

        if (cartResult.length === 0) {
            // 2. No cart? Create one!
            db.query("INSERT INTO cart (user_id) VALUES (?)", [user_id], (err, newCart) => {
                cart_id = newCart.insertId;
                addItemToCart(cart_id, product_id, quantity, res);
            });
        } else {
            // Use existing cart
            cart_id = cartResult[0].cart_id;
            addItemToCart(cart_id, product_id, quantity, res);
        }
    });
});

// Helper function to handle the "cart_items" logic
function addItemToCart(cart_id, product_id, quantity, res) {
    // Check if product is already in the cart
    const checkItemSql = "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?";
    
    db.query(checkItemSql, [cart_id, product_id], (err, itemResult) => {
        if (itemResult.length > 0) {
            // Update quantity
            const updateSql = "UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?";
            db.query(updateSql, [quantity, cart_id, product_id], (err) => {
                res.json({ message: "Cart updated (Quantity increased) ✅" });
            });
        } else {
            // Insert new item
            const insertSql = "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)";
            db.query(insertSql, [cart_id, product_id, quantity], (err) => {
                res.json({ message: "Item added to cart! 🛒" });
            });
        }
    });
}

app.get('/cart/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const sql = `
        SELECT ci.cart_item_id, p.name, p.price, ci.quantity 
        FROM cart_items ci
        JOIN cart c ON ci.cart_id = c.cart_id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = ?`;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


app.post('/checkout', (req, res) => {
    const { user_id } = req.body;

    // 1. Get all items from the user's cart
    const cartSql = `
        SELECT ci.*, p.price FROM cart_items ci 
        JOIN cart c ON ci.cart_id = c.cart_id 
        JOIN products p ON ci.product_id = p.id 
        WHERE c.user_id = ?`;

    db.query(cartSql, [user_id], (err, items) => {
        if (err || items.length === 0) return res.status(400).json({ error: "Cart is empty" });

        // 2. Calculate Total Amount
        let totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 3. Create the Order
        const orderSql = "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'Pending')";
        db.query(orderSql, [user_id, totalAmount], (err, orderResult) => {
            if (err) return res.status(500).json(err);

            const orderId = orderResult.insertId;

            // 4. Move items to order_items table
            const orderItemsData = items.map(item => [orderId, item.product_id, item.quantity, item.price]);
            const orderItemsSql = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?";
            
            db.query(orderItemsSql, [orderItemsData], (err) => {
                if (err) return res.status(500).json(err);

                // 5. CLEAR THE CART after successful order
                db.query("DELETE ci FROM cart_items ci JOIN cart c ON ci.cart_id = c.cart_id WHERE c.user_id = ?", [user_id], () => {
                    res.json({ message: "Order placed successfully! 🎉", orderId, totalAmount });
                });
            });
        });
    });
});


app.get('/orders/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";

    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});