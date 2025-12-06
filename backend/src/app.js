import express from 'express';
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import studentRoute from './routes/studentRoute.js'
import { authenticate, authorize } from './middlewares/authMiddleware.js';
import admissionRoutes from './routes/admissionRoutes.js'

const app = express();

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/auth', authRoute);
app.use('/api/users',authenticate,authorize(['admin']),userRoute);
app.use('/api/students',studentRoute)

app.use("/api/admission", admissionRoutes);



export default app;