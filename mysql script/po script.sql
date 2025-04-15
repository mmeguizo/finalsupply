CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier VARCHAR(255),
    address VARCHAR(255),
    ponumber INT,
    mode_of_procurement VARCHAR(255),
    email VARCHAR(255),
    telephone VARCHAR(20),
    place_of_delivery VARCHAR(255),
    date_of_delivery DATE,
    date_of_payment DATE,
    delivery_terms TEXT,
    payment_terms TEXT,purchase_order_items
    invoice VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('partial', 'close', 'cancel', 'completed', 'pending') DEFAULT 'pending',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
