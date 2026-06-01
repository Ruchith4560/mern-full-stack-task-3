// server/src/server.js
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀  Server: http://localhost:${PORT}`);
    console.log(`🔐  JWT expires in: ${process.env.JWT_EXPIRES_IN || '7d'}\n`);
  });
});
