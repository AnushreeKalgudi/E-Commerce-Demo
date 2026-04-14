// Check if a user is logged in when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('userName');
    const userDisplay = document.getElementById('user-display');
    const logoutBtn = document.getElementById('logout-btn');

    if (savedName) {
        // 1. Show the user's name
        userDisplay.innerText = savedName;
        // 2. Show the logout button
        logoutBtn.style.display = 'inline';
        // 3. Disable the login link so they don't go back to auth.html while logged in
        userDisplay.style.pointerEvents = 'none';
    } else {
        // If not logged in, make sure it says "login" and links to auth page
        userDisplay.innerText = "login";
        userDisplay.onclick = () => { window.location.href = 'auth.html'; };
    }

    loadProducts(); // Your existing product loader
});

// LOGOUT FUNCTIONALITY
function handleLogout() {
    // 1. Remove the name from storage
    localStorage.removeItem('userName');
    
    // 2. Alert the user (optional)
    alert("You have been logged out.");
    
    // 3. Refresh the page to reset the UI
    window.location.reload();
}


async function loadProducts() {
    try {
        const response = await fetch('http://localhost:5000/products');
        const products = await response.json();
        const container = document.getElementById('products-container');
        container.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="info">
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                    <button class="buy-btn" onclick="addToCart(${product.id})">Add to Bag</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Database connection failed", err);
    }
}

function toggleCart() {
    alert("Cart functionality coming soon!");
}

loadProducts();

let cart = [];
let allProducts = []; // To store products fetched from DB

async function loadProducts() {
    const container = document.getElementById('products-container');
    try {
        const response = await fetch('http://localhost:5000/products');
        allProducts = await response.json(); // Save products for cart lookup
        
        container.innerHTML = '';
        allProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <button class="buy-btn" onclick="addToCart(${product.id})">Add to Bag</button>
            `;
            container.appendChild(card);
        });
    } catch (err) { console.error("Load failed", err); }
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
    document.getElementById('cart-overlay').classList.toggle('active');
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartUI();
        // Optional: Open cart automatically when item added
        if(!document.getElementById('cart-sidebar').classList.contains('active')) toggleCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('total-price');
    const countDisplay = document.getElementById('cart-count');
    
    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += parseFloat(item.price);
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${item.image}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price}</p>
                <span class="remove-item" onclick="removeFromCart(${index})">Remove</span>
            </div>
        `;
        cartContainer.appendChild(itemDiv);
    });

    totalDisplay.innerText = `$${total.toFixed(2)}`;
    countDisplay.innerText = cart.length;
}

function checkout() {
    if (cart.length === 0) return alert("Your cart is empty!");
    
    const userName = localStorage.getItem('userName') || "Guest";
    alert(`Thank you, ${userName}! Your order for ${cart.length} items has been placed.`);
    
    cart = [];
    updateCartUI();
    toggleCart();
}