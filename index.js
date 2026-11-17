import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import recintosRouter from './routes/recintos.js';
import eventosRouter from './routes/eventos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventos';

// Middleware para parsear peticiones en formato JSON
app.use(express.json());

// Montaje de rutas
app.use('/recintos', recintosRouter);
app.use('/eventos', eventosRouter);

// Conexión a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Conexión con MongoDB realizada correctamente');
  })
  .catch((err) => {
    console.error('Error al conectar con MongoDB:', err.message);
  });

// Arranque del servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

export default app;
