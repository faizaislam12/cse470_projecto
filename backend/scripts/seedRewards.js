require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const Reward = require('../models/Reward');

const sampleRewards = [
  {
    name: '10% Discount Voucher',
    description: 'Get a 10% discount voucher redeemable at participating eco-friendly stores and online partners.',
    pointsCost: 500,
    category: 'voucher',
    stock: -1,
    isActive: true,
  },
  {
    name: 'Free Pickup Service',
    description: 'Redeem for one free scheduled pickup service — a collector will come to your location at no charge.',
    pointsCost: 300,
    category: 'discount',
    stock: 50,
    isActive: true,
  },
  {
    name: 'Plant a Tree Donation',
    description: 'Your points fund the planting of one tree in a reforestation project. Make a real environmental impact!',
    pointsCost: 200,
    category: 'donation',
    stock: -1,
    isActive: true,
  },
  {
    name: 'Eco-Friendly Tote Bag',
    description: 'A durable, reusable tote bag made from 100% recycled materials. Delivered to your doorstep.',
    pointsCost: 150,
    category: 'product',
    stock: 100,
    isActive: true,
  },
  {
    name: 'Coffee Voucher',
    description: 'Enjoy a complimentary coffee at any partner café. Show your redemption code at the counter.',
    pointsCost: 100,
    category: 'voucher',
    stock: 200,
    isActive: true,
  },
  {
    name: 'GreenLoop Premium Badge',
    description: 'Unlock the exclusive GreenLoop Premium Badge displayed on your profile — a symbol of top recyclers.',
    pointsCost: 1000,
    category: 'product',
    stock: -1,
    isActive: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const existing = await Reward.countDocuments();
    if (existing > 0) {
      console.log(`Rewards already seeded (${existing} found). Skipping.`);
    } else {
      await Reward.insertMany(sampleRewards);
      console.log(`✅ Successfully seeded ${sampleRewards.length} rewards.`);
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
