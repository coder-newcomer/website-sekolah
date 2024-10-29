fetch('http://localhost:3000/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: '1234',
    nickname: 'User',
  }),
})
  .then((response) => response.text())
  .then((body) => console.log(body))
