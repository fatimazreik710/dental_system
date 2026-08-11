const https = require('https');

const data = JSON.stringify({
  username: 'dr.farah@example.com',
  password: 'password123'
});

const req = https.request('https://dental-system-qns3.onrender.com/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Body:', body);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
