require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const email = 'admin@greenloop.com';
    let admin = await User.findOne({ email });

    if (admin) {
      console.log('Admin already exists.');
    } else {
      const hashedPassword = await bcrypt.hash('password123', 10);
      admin = await User.create({
        name: 'System Admin',
        email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user created successfully!');
    }

    console.log(`\n--- ADMIN CREDENTIALS ---`);
    console.log(`Email: admin@greenloop.com`);
    console.log(`Password: password123`);
    console.log(`-------------------------\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
