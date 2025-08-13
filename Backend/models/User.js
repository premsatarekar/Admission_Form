// backend/models/User.js
import pool from '../config/db.js';

class User {
  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [
      username,
    ]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    return rows[0];
  }

  static async createResetToken(userId, token, expiresAt) {
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  }

  static async findValidToken(userId, token) {
    const [rows] = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE user_id = ? AND token = ? AND expires_at > NOW()',
      [userId, token]
    );
    return rows[0];
  }

  static async deleteToken(id) {
    await pool.query('DELETE FROM password_reset_tokens WHERE id = ?', [id]);
  }

  static async updatePassword(userId, newPassword) {
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [
      newPassword,
      userId,
    ]);
  }
}

export default User;
