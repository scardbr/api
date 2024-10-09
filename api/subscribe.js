import fetch from 'node-fetch';  // Import node-fetch

export default async function handler(req, res) {
  // List of allowed origins
  const allowedOrigins = ['https://eot-b7d811.webflow.io', 'https://employee-ownership.ca'];
  const origin = req.headers.origin;

  // Check if the request's origin is in the allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Allow specific HTTP methods and headers
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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

    const API_KEY = process.env.MAILCHIMP_API_KEY;  // Your Mailchimp API key
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;  // Your Mailchimp list ID
    const SERVER_PREFIX = process.env.SERVER_PREFIX;  // Your Mailchimp server prefix

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
        return res.status(200).json({ message: 'Subscription successful' });
      } else {
        const error = await response.json();
        return res.status(response.status).json(error);
      }
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  } else {
    // Handle unsupported methods
    res.status(405).json({ message: 'Method not allowed' });
  }
}
