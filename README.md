 Premium E-Commerce Store

A full-stack premium e-commerce application . This project features a dynamic product grid, a category bento-style layout, a functional shopping cart, and a full user authentication system.

## 🚀 Features
* **Modern UI:** Responsive design with a "Bento Grid" category layout.
* **User Authentication:** Dedicated Login and Registration pages connected to MySQL.
* **Product Management:** Best-seller products fetched dynamically from a backend API.
* **Shopping Cart:** Slide-out sidebar cart with real-time price calculation.
* **Database Driven:** Uses MySQL for secure user data and product storage.

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript |
| **Backend** | Node.js, Express.js Framework |
| **Database** | MySQL 8.0 |
| **Testing** | Postman API Client |


## 📂 Project Structure

```text
├── public/                 # Frontend assets
│   ├── index.html          # Main landing page
│   ├── auth.html           # Login/Register page
│   ├── style.css           # Global styles & Bento Grid
│   ├── script.js           # Home page & Cart logic
│   └── auth-script.js      # Authentication logic
├── server/
│   └── index.js            # Node.js API & Database connection
├── .gitignore              # Files to ignore (node_modules, .env)
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation

⚙️ Backend API Endpoints
Authentication
POST /register : Creates a new user record.

POST /login : Validates credentials and returns user details.

Products
GET /products : Fetches all available products from the database.


🏗️ Installation & Setup
1. Prerequisites
Install Node.js (v14+)

Install MySQL Server and MySQL Workbench

2. Database Configuration
Run the following script in your MySQL Workbench to set up the environment:

SQL
CREATE DATABASE ecommerce_p;
USE ecommerce_p;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    price DECIMAL(10,2),
    image VARCHAR(255)
);
3. Server Setup
Bash
# Install dependencies
npm install express mysql2 cors body-parser

# Start the server
node index.js
4. Launching the App
Simply open index.html using Live Server in VS Code or open the file directly in any modern browser.

👤 Author
Your Name - GitHub:AnushreeKalgudi
LinkedIn:www.linkedin.com/in/anushree-kalgudi-53b701321
