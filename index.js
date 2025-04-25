import express from "express";
import dotenv from 'dotenv';
dotenv.config(); // Doit être appelé avant tout autre code
import movieRoutes from "./routes/movieRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from './routes/authRoutes.js';

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";


const PORT = 3000;

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use("/movies", movieRoutes);
app.use("/users", userRoutes);
app.use('/connection', authRoutes);



/////////
// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation de l\'API pour gérer l\'authentification et les utilisateurs',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
  },
  apis: ['./routes/*.js'], // Mettre à jour le chemin selon vos fichiers de routes
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Exposer Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
//////////////



app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('JWT_SECRET:', process.env.JWT_SECRET); // Vérifiez la valeur de JWT_SECRET
});
