import bcrypt from 'bcryptjs';
import db from '../config/db.js';  // your DB connection

async function addUser() {
  const username = 'Prem';
  const email = 'premsatarekar@gmail.com';
  const phone = '8792018045';        // provide phone here
  const plainPassword = 'prem123';

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  const query = `
    INSERT INTO users (username, email, phone, password)
    VALUES (?, ?, ?, ?)
  `;

  try {
    await db.execute(query, [username, email, phone, hashedPassword]);
    console.log('User added successfully!');
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

addUser();
