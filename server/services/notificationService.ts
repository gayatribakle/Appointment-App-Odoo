import pool from '../db.js';
import { notifyUser } from '../socket.js';

export const createNotification = async (userId: number, title: string, message: string, type: string = 'info') => {
  console.log(`🔔 Creating notification for User ${userId}: ${title}`);
  try {
    const result = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, message, type]
    );
    const notification = result.rows[0];
    
    // Push real-time via Socket.io
    notifyUser(userId, notification);
    console.log(`✅ Notification pushed to User ${userId}`);
    
    return notification;
  } catch (err) {
    console.error('❌ Failed to create notification:', err);
  }
};
