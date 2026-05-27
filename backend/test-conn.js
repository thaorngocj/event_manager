const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mydb_test',
    password: 'postpass',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to mydb_test successfully.');
  } catch (err) {
    console.error('Error connecting:', err);
  } finally {
    await client.end();
  }
}

testConnection();
