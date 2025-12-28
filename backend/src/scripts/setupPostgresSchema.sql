-- CipherSQLStudio Sample Database Schema
-- This script creates sample tables and data for SQL practice

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS categories;

-- Create categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Create customers table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(200),
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    registration_date DATE DEFAULT CURRENT_DATE
);

-- Create products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES categories(category_id),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    description TEXT,
    created_date DATE DEFAULT CURRENT_DATE
);

-- Create orders table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    order_date DATE DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    shipping_address VARCHAR(200)
);

-- Create order_items table
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);

-- Insert sample data

-- Categories
INSERT INTO categories (category_name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Books', 'Physical and digital books'),
('Clothing', 'Apparel and accessories'),
('Home & Garden', 'Home improvement and gardening supplies'),
('Sports', 'Sports equipment and accessories');

-- Customers
INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code, registration_date) VALUES
('John', 'Doe', 'john.doe@email.com', '555-0101', '123 Main St', 'New York', 'NY', '10001', '2023-01-15'),
('Jane', 'Smith', 'jane.smith@email.com', '555-0102', '456 Oak Ave', 'Los Angeles', 'CA', '90210', '2023-02-20'),
('Mike', 'Johnson', 'mike.johnson@email.com', '555-0103', '789 Pine Rd', 'Chicago', 'IL', '60601', '2023-03-10'),
('Sarah', 'Williams', 'sarah.williams@email.com', '555-0104', '321 Elm St', 'Houston', 'TX', '77001', '2023-04-05'),
('David', 'Brown', 'david.brown@email.com', '555-0105', '654 Maple Dr', 'Phoenix', 'AZ', '85001', '2023-05-12'),
('Lisa', 'Davis', 'lisa.davis@email.com', '555-0106', '987 Cedar Ln', 'Philadelphia', 'PA', '19101', '2023-06-18'),
('Tom', 'Wilson', 'tom.wilson@email.com', '555-0107', '147 Birch St', 'San Antonio', 'TX', '78201', '2023-07-22'),
('Amy', 'Garcia', 'amy.garcia@email.com', '555-0108', '258 Spruce Ave', 'San Diego', 'CA', '92101', '2023-08-30'),
('Chris', 'Martinez', 'chris.martinez@email.com', '555-0109', '369 Willow Rd', 'Dallas', 'TX', '75201', '2023-09-14'),
('Emma', 'Anderson', 'emma.anderson@email.com', '555-0110', '741 Poplar Dr', 'San Jose', 'CA', '95101', '2023-10-08');

-- Products
INSERT INTO products (product_name, category_id, price, stock_quantity, description) VALUES
('Smartphone Pro', 1, 899.99, 50, 'Latest smartphone with advanced features'),
('Laptop Ultra', 1, 1299.99, 30, 'High-performance laptop for professionals'),
('Wireless Headphones', 1, 199.99, 100, 'Premium noise-canceling headphones'),
('Programming Guide', 2, 49.99, 200, 'Complete guide to modern programming'),
('Fiction Novel', 2, 14.99, 150, 'Bestselling fiction novel'),
('T-Shirt Classic', 3, 24.99, 300, 'Comfortable cotton t-shirt'),
('Jeans Premium', 3, 79.99, 120, 'High-quality denim jeans'),
('Garden Tools Set', 4, 89.99, 75, 'Complete set of gardening tools'),
('Indoor Plant', 4, 19.99, 200, 'Low-maintenance indoor plant'),
('Tennis Racket', 5, 129.99, 40, 'Professional tennis racket'),
('Running Shoes', 5, 119.99, 80, 'Comfortable running shoes'),
('Yoga Mat', 5, 39.99, 60, 'Non-slip yoga mat');

-- Orders
INSERT INTO orders (customer_id, order_date, total_amount, status, shipping_address) VALUES
(1, '2023-11-01', 1099.98, 'completed', '123 Main St, New York, NY 10001'),
(2, '2023-11-02', 64.98, 'completed', '456 Oak Ave, Los Angeles, CA 90210'),
(1, '2023-11-03', 199.99, 'shipped', '123 Main St, New York, NY 10001'),
(3, '2023-11-04', 209.98, 'completed', '789 Pine Rd, Chicago, IL 60601'),
(4, '2023-11-05', 129.99, 'pending', '321 Elm St, Houston, TX 77001'),
(2, '2023-11-06', 159.98, 'shipped', '456 Oak Ave, Los Angeles, CA 90210'),
(5, '2023-11-07', 89.99, 'completed', '654 Maple Dr, Phoenix, AZ 85001'),
(6, '2023-11-08', 1419.98, 'completed', '987 Cedar Ln, Philadelphia, PA 19101'),
(3, '2023-11-09', 39.99, 'shipped', '789 Pine Rd, Chicago, IL 60601'),
(7, '2023-11-10', 249.98, 'completed', '147 Birch St, San Antonio, TX 78201'),
(8, '2023-11-11', 79.99, 'pending', '258 Spruce Ave, San Diego, CA 92101'),
(1, '2023-11-12', 119.99, 'completed', '123 Main St, New York, NY 10001'),
(9, '2023-11-13', 19.99, 'shipped', '369 Willow Rd, Dallas, TX 75201'),
(10, '2023-11-14', 174.98, 'completed', '741 Poplar Dr, San Jose, CA 95101'),
(4, '2023-11-15', 49.99, 'pending', '321 Elm St, Houston, TX 77001');

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
-- Order 1 (John Doe)
(1, 1, 1, 899.99, 899.99),
(1, 3, 1, 199.99, 199.99),
-- Order 2 (Jane Smith)
(2, 4, 1, 49.99, 49.99),
(2, 5, 1, 14.99, 14.99),
-- Order 3 (John Doe)
(3, 3, 1, 199.99, 199.99),
-- Order 4 (Mike Johnson)
(4, 10, 1, 129.99, 129.99),
(4, 6, 2, 24.99, 49.99),
(4, 9, 1, 19.99, 19.99),
-- Order 5 (Sarah Williams)
(5, 10, 1, 129.99, 129.99),
-- Order 6 (Jane Smith)
(6, 11, 1, 119.99, 119.99),
(6, 12, 1, 39.99, 39.99),
-- Order 7 (David Brown)
(7, 8, 1, 89.99, 89.99),
-- Order 8 (Lisa Davis)
(8, 2, 1, 1299.99, 1299.99),
(8, 11, 1, 119.99, 119.99),
-- Order 9 (Mike Johnson)
(9, 12, 1, 39.99, 39.99),
-- Order 10 (Tom Wilson)
(10, 6, 5, 24.99, 124.99),
(10, 7, 1, 79.99, 79.99),
(10, 9, 2, 19.99, 39.98),
-- Order 11 (Amy Garcia)
(11, 7, 1, 79.99, 79.99),
-- Order 12 (John Doe)
(12, 11, 1, 119.99, 119.99),
-- Order 13 (Chris Martinez)
(13, 9, 1, 19.99, 19.99),
-- Order 14 (Emma Anderson)
(14, 4, 2, 49.99, 99.98),
(14, 6, 3, 24.99, 74.97),
-- Order 15 (Sarah Williams)
(15, 4, 1, 49.99, 49.99);

-- Create indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_city ON customers(city);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Display table information
SELECT 'Database setup completed successfully!' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;