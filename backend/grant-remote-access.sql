-- Grant remote access to MySQL for network database access
-- Run this in phpMyAdmin SQL tab

-- Allow root user to connect from any IP address
GRANT ALL PRIVILEGES ON rmd_dashboard.* TO 'root'@'%' IDENTIFIED BY '';

-- Flush privileges to apply changes immediately
FLUSH PRIVILEGES;

-- Verify the user was created/updated
SELECT user, host FROM mysql.user WHERE user = 'root';
