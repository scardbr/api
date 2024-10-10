export default async function handler(req, res) {
  const allowedOrigins = ['https://eot-b7d811.webflow.io', 'https://www.employee-ownership.ca', 'https://employee-ownership.ca'];
  const origin = req.headers.origin;

  // Verificar si el origen de la solicitud está permitido
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight request (CORS OPTIONS)
  if (req.method === 'OPTIONS') {
    // Responder a la solicitud preflight con los encabezados necesarios
    res.setHeader('Access-Control-Allow-Origin', origin); // Incluir origin permitido
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return; // Terminar la ejecución aquí para solicitudes OPTIONS
  }

  if (req.method === 'POST') {
    try {
      // Asegúrate de que el body sea JSON
      const { email, first_name, last_name } = req.body;

      const data = {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: first_name,
          LNAME: last_name
        }
      };

      // Variables de entorno para la API de Mailchimp
      const API_KEY = process.env.MAILCHIMP_API_KEY;
      const LIST_ID = process.env.MAILCHIMP_LIST_ID;
      const SERVER_PREFIX = process.env.SERVER_PREFIX;

      const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/`;

      // Enviar solicitud a la API de Mailchimp
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        return res.status(200).json({ message: 'Subscription successful' });
      } else {
        const error = await response.json();
        return res.status(response.status).json(error);
      }
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  } else {
    // Manejo de métodos no permitidos
    res.status(405).json({ message: 'Method not allowed' });
  }
}
