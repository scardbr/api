import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, first_name, last_name } = req.body;

    const data = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: first_name,
        LNAME: last_name
      }
    };

    const API_KEY = process.env.MAILCHIMP_API_KEY;  // Configura tu API key en las variables de entorno
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;  // Configura el ID de tu lista
    const SERVER_PREFIX = 'us8';  // Por ejemplo: us19

    const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return res.status(200).json({ message: 'Suscripción exitosa' });
      } else {
        const error = await response.json();
        return res.status(response.status).json(error);
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}
