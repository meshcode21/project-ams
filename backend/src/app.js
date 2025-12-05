import express from 'express';
import authRoute from './routes/authRoute.js'
// import { authenticate } from './middlewares/authMiddleware.js';
import userRoute from './routes/userRoute.js'
import studentRoute from './routes/studentRoute.js'
import { authenticate, authorize } from './middlewares/authMiddleware.js';

const app = express();

app.use(express.json())
// app.use('/api',authenticate);

app.get('/', (req, res) => {
    res.send('Hello, World! I am api.');
});

app.use('/auth', authRoute);
app.use('/api/users',authenticate,authorize(['student']),userRoute);
app.use('/api/students',studentRoute)



export default app;