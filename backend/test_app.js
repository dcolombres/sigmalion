const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.put('/test', (req, res) => {
  res.send('Test route hit!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});