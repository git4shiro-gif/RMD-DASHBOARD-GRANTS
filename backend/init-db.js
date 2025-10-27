import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
    try {
        // First connection without database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Connected to MySQL server');

        // Read and execute schema.sql
        const schema = fs.readFileSync('./database/schema.sql', 'utf8');
        const statements = schema.split(';').filter(statement => statement.trim());
        
        for (let statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
                console.log('Executed:', statement.trim().split('\n')[0]);
            }
        }

        console.log('Database initialization completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();