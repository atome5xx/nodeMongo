import express from "express";
import dotenv from 'dotenv';
dotenv.config(); // Doit être appelé avant tout autre code
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const PORT = 3000;

const app = express();

app.use(express.json());

app.use('/connection', authRoutes);
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('JWT_SECRET:', process.env.JWT_SECRET); // Vérifiez la valeur de JWT_SECRET
});
