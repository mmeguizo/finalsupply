CREATE TABLE purchase_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ponumber INT NOT NULL,
    item VARCHAR(255),
    description TEXT,
    unit VARCHAR(50),
    quantity INT,
    unitCost DECIMAL(10,2),
    amount DECIMAL(10,2),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actual_quantity_received INT,
    category ENUM(
        '',
        'property acknowledgement receipt',
        'inventory custodian slip',
        'requisition issue slip'
    ) DEFAULT '',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key reference to purchase_orders table
    CONSTRAINT fk_purchase_order FOREIGN KEY (ponumber) 
    REFERENCES purchase_orders(id) ON DELETE CASCADE
);
