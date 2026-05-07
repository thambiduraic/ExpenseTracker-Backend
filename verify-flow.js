const http = require('http');

const post = (path, data) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
};

const get = (path, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
};

const runTest = async () => {
  console.log('--- Phase 1: Registration ---');
  const email = `test${Date.now()}@example.com`;
  const reg = await post('/auth/register', {
    name: 'Verification User',
    email: email,
    password: 'Password123!',
    balance: 5000
  });
  console.log('Reg Status:', reg.status);
  console.log('Reg Data:', JSON.stringify(reg.data, null, 2));

  if (reg.status !== 201) {
    console.error('Registration failed!');
    return;
  }

  console.log('\n--- Phase 2: Login ---');
  const log = await post('/auth/login', {
    email: email,
    password: 'Password123!'
  });
  console.log('Login Status:', log.status);
  console.log('Login Data:', JSON.stringify(log.data, null, 2));

  if (log.status !== 200) {
    console.error('Login failed!');
    return;
  }

  const token = log.data.data.token;

  console.log('\n--- Phase 3: Token Verification (/auth/me) ---');
  const me = await get('/auth/me', token);
  console.log('Me Status:', me.status);
  console.log('Me Data:', JSON.stringify(me.data, null, 2));

  if (me.status === 200) {
    console.log('\n✅ Verification Successful: Flow is working correctly.');
  } else {
    console.log('\n❌ Verification Failed: Token or route issue.');
  }
};

runTest().catch(console.error);
