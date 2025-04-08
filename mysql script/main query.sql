-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(255) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     email VARCHAR(255) NOT NULL,
--     full_name VARCHAR(255) NOT NULL,
--     is_active TINYINT(1) DEFAULT 1,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );


-- CREATE TABLE suppliers (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     address VARCHAR(255) NOT NULL,
--     email VARCHAR(255) NOT NULL,
--     telephone VARCHAR(20) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- CREATE TABLE purchase_orders (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     supplier_id INT,
--     ponumber INT NOT NULL,
--     mode_of_procurement VARCHAR(255) NOT NULL,
--     place_of_delivery VARCHAR(255) NOT NULL,
--     date_of_delivery DATE NOT NULL,
--     date_of_payment DATE NOT NULL,
--     delivery_terms TEXT,
--     payment_terms TEXT,
--     amount DECIMAL(10, 2) NOT NULL,
--     status ENUM('partial', 'closed', 'cancel', 'completed', 'pending') DEFAULT 'pending',
--     is_deleted TINYINT(1) DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
-- );


-- CREATE TABLE purchase_order_items (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     purchase_order_id INT NOT NULL,
--     item_name VARCHAR(255) NOT NULL,
--     description TEXT,
--     unit VARCHAR(50),
--     quantity INT,
--     unit_cost DECIMAL(10, 2),
--     amount DECIMAL(10, 2),
--     actual_quantity_received INT,
--     category ENUM('property acknowledgement receipt', 'inventory custodian slip', 'requisition issue slip') DEFAULT 'requisition issue slip',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
-- );


-- CREATE TABLE purchase_order_status_history (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     purchase_order_id INT NOT NULL,
--     status ENUM('partial', 'closed', 'cancel', 'completed', 'pending'),
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
-- );

-- insert values
-- INSERT INTO users (username, password, email, full_name, is_active, created_at, updated_at)
-- VALUES
-- ('mmeguizo@chmsu.edu.ph', 
--  '$2b$10$QaXozXayLKBz5jykSY./P.R0z5irGh1JUis7RxAzvBzD1gaofDsNO', 
--  'mmeguizo@chmsu.edu.ph', 
--  'Mark Oliver Meguizo', 
--  1, 
--  '2025-03-04 02:41:32', 
--  '2025-03-04 02:41:32');sessions






