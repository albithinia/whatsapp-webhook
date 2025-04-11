// Importar las dependencias necesarias
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config(); // Cargar variables de entorno

// Configuración del servidor Express
const app = express();
app.use(bodyParser.json());

// Claves de las APIs (se cargan desde las variables de entorno)
const whatsappToken = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;
const prestashopApiKey = process.env.PRESTASHOP_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

// Ruta principal para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('Servidor de WhatsApp Webhook funcionando 🚀');
});

// Función para enviar mensaje a WhatsApp
const sendMessage = async (to, message) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v13.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
  }
};

// Función para interactuar con ChatGPT y obtener una respuesta
const getChatGPTResponse = async (userMessage) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: userMessage,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error al interactuar con ChatGPT:', error);
    return 'Lo siento, no pude procesar tu solicitud.';
  }
};

// Función para obtener datos de PrestaShop (por ejemplo, pedidos)
const getPrestaShopData = async () => {
  try {
    const response = await axios.get('https://tusitioprestashop.com/api/orders', {
      headers: {
        'Authorization': `Basic ${prestashopApiKey}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de PrestaShop:', error);
    return null;
  }
};

// Endpoint para recibir mensajes de WhatsApp (Webhook)
app.post('/webhook', async (req, res) => {
  const incomingMessage = req.body.messages[0].text.body;
  const fromNumber = req.body.messages[0].from;

  console.log(`Mensaje recibido: ${incomingMessage} de ${fromNumber}`);

  // Llamar a ChatGPT para procesar el mensaje
  let responseMessage = await getChatGPTResponse(incomingMessage);

  // Si el mensaje contiene la palabra 'pedido', obtenemos los datos de PrestaShop
  if (incomingMessage.includes('pedido')) {
    const orders = await getPrestaShopData();
    responseMessage += `\n Información de pedidos: ${JSON.stringify(orders)}`;
  }

  // Enviar la respuesta a WhatsApp
  await sendMessage(fromNumber, responseMessage);

  // Responder al webhook
  res.send('OK');
});

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${port}`);
});
