
import express from 'express';
import transactionRoutes from './routes/transactionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

app.use(express.json());


app.use('/api/users', transactionRoutes);
app.use('/api/notifications', notificationRoutes);


export default app;
