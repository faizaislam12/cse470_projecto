require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
const mongoose = require('mongoose');
const Category = require('../models/Category');
const MarketPrice = require('../models/MarketPrice');

const categories = [
  { name: 'Plastic', description: 'PET bottles, HDPE containers, plastic wrappers.', icon: 'droplet', defaultPointsPerKg: 15, defaultPricePerKg: 0.8 },
  { name: 'Paper & Cardboard', description: 'Newspapers, cardboard boxes, office paper.', icon: 'file-text', defaultPointsPerKg: 10, defaultPricePerKg: 0.4 },
  { name: 'Metal', description: 'Aluminum cans, tin cans, copper wires, iron scrap.', icon: 'shield', defaultPointsPerKg: 25, defaultPricePerKg: 1.5 },
  { name: 'Glass', description: 'Glass jars, bottles, broken glassware.', icon: 'wine', defaultPointsPerKg: 8, defaultPricePerKg: 0.3 },
  { name: 'E-Waste', description: 'Batteries, chargers, old smartphones, cables.', icon: 'cpu', defaultPointsPerKg: 50, defaultPricePerKg: 3.5 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for seeding...');
    await Category.deleteMany();
    await MarketPrice.deleteMany();
    try { await Category.collection.dropIndexes(); } catch(e) {}
    const created = await Category.insertMany(categories);
    console.log(`Seeded ${created.length} categories.`);
    for (const cat of created) {
      const history = [];
      for (let i = 5; i > 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const f = (Math.random() * 20 - 10) / 100;
        history.push({ date: d, price: Math.round(cat.defaultPricePerKg * (1 + f) * 100) / 100 });
      }
      await MarketPrice.create({ category: cat._id, currentPrice: cat.defaultPricePerKg, unit: 'kg', trend: 'Stable', priceHistory: history });
    }
    console.log('Seeded market prices. Done!');
    mongoose.connection.close();
  } catch (e) { console.error('Seed error:', e.message); process.exit(1); }
};
seed();
