fetch('/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(Math),
})
  .then((response) => response.text())
  .then((body) => console.log(body))
