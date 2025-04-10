// Importar las dependencias
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Configuración de bodyParser para leer JSON en las peticiones
app.use(bodyParser.json());

// Ruta principal (root) para verificar que el servidor está activo
app.get('/', (req, res) => {
  res.send('Servidor de WhatsApp Webhook funcionando 🚀');
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
