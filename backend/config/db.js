const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Copy .env.example to .env and add your Atlas connection string.');
    process.exit(1);
  }

  try {
    // serverSelectionTimeoutMS fails fast instead of hanging when Atlas
    // is unreachable (wrong IP whitelist, bad credentials, DNS issues, etc.)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error(
        '\nTroubleshooting for MongoDB Atlas:\n' +
          '  1. Atlas dashboard -> Network Access -> add your current IP (or 0.0.0.0/0 for testing).\n' +
          '  2. Atlas dashboard -> Connect -> Drivers -> copy the exact connection string and make sure\n' +
          '     the password and database name in MONGO_URI are correct (no angle brackets left in).\n' +
          '  3. If "querySrv ECONNREFUSED" persists, your network/DNS is blocking SRV lookups.\n' +
          '     Switch your DNS to 8.8.8.8 / 1.1.1.1, run "ipconfig /flushdns", or disconnect any VPN.\n'
      );
    }

    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error(
        '\nAuthentication failed: double-check the Atlas database user\'s username/password in\n' +
          'MONGO_URI, and make sure any special characters in the password are URL-encoded.\n'
      );
    }

    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Mongoose will attempt to reconnect automatically.');
  });
};

module.exports = connectDB;
