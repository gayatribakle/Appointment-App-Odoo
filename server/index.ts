import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import slotRoutes from './routes/slots.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import providerRoutes from './routes/providers.js';

import { createServer } from 'http';
import { initSocket } from './socket.js';
import notificationRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payments.js';
import { verifyToken } from './middleware/authMiddleware.js';
import { getMeetingLink, updateMeetingStatus } from './controllers/meetingController.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(server);

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'], credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);       
app.use('/api/providers', providerRoutes);     
app.use('/api/bookings', bookingRoutes);       
app.use('/api/slots', slotRoutes);             
app.use('/api/dashboard', dashboardRoutes);    
app.use('/api/admin', adminRoutes);            
app.use('/api/user', userRoutes);              
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Meeting Routes
app.get('/api/meetings/:bookingId', verifyToken, getMeetingLink);
app.patch('/api/meetings/:bookingId/status', verifyToken, updateMeetingStatus);

app.get('/api/health', (_req, res) => res.json({ status: 'OK', time: new Date().toISOString() }));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

server.listen(Number(PORT), '0.0.0.0', () => console.log(`✅ Server running on http://localhost:${PORT}`));

export default app;
