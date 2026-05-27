const { Client } = require('pg');

async function createDatabase() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postpass',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server.');
    await client.query('CREATE DATABASE mydb_test');
    console.log('Database mydb_test created successfully.');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database mydb_test already exists.');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
