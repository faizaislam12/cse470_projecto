// Seeds a realistic, re-runnable set of test data covering every feature owned by
// this module (EcoPoints, Rewards/Redemption, Impact Dashboard, Goals, Certificates)
// plus the surrounding Marketplace data those features read from.
//
// Safe to re-run: it only ever deletes/resets data scoped to its own @test.com
// accounts, and upserts (rather than duplicates) Categories and Rewards.
//
// Usage:  cd backend && node scripts/seedTestData.js

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Listing = require('../models/Listing');
const Transaction = require('../models/Transaction');
const Reward = require('../models/Reward');
const Goal = require('../models/Goal');
const Certificate = require('../models/Certificate');

const TEST_PASSWORD = 'Test@1234';

const CATEGORIES = [
  { name: 'Plastic', description: 'PET bottles, HDPE containers, plastic wrappers.', icon: 'droplet', defaultPointsPerKg: 15, defaultPricePerKg: 0.8 },
  { name: 'Paper & Cardboard', description: 'Newspapers, cardboard boxes, office paper.', icon: 'file-text', defaultPointsPerKg: 10, defaultPricePerKg: 0.4 },
  { name: 'Metal', description: 'Aluminum cans, tin cans, copper wires, iron scrap.', icon: 'shield', defaultPointsPerKg: 25, defaultPricePerKg: 1.5 },
  { name: 'Glass', description: 'Glass jars, bottles, broken glassware.', icon: 'wine', defaultPointsPerKg: 8, defaultPricePerKg: 0.3 },
  { name: 'E-Waste', description: 'Batteries, chargers, old smartphones, cables.', icon: 'cpu', defaultPointsPerKg: 50, defaultPricePerKg: 3.5 },
];

const TEST_USERS = [
  { name: 'Hasan Household', email: 'household1@test.com', role: 'household' },
  { name: 'Nabila Household', email: 'household2@test.com', role: 'household' },
  { name: 'Karim Collector', email: 'collector1@test.com', role: 'collector' },
  { name: 'GreenMart Business', email: 'business1@test.com', role: 'business' },
  { name: 'Admin Ayesha', email: 'admin@test.com', role: 'admin' },
];

const REWARDS = [
  { name: '10% Discount Voucher', description: 'Get a 10% discount voucher redeemable at participating eco-friendly stores and online partners.', pointsCost: 500, category: 'voucher', stock: -1, isActive: true },
  { name: 'Free Pickup Service', description: 'Redeem for one free scheduled pickup service — a collector will come to your location at no charge.', pointsCost: 300, category: 'discount', stock: 50, isActive: true },
  { name: 'Plant a Tree Donation', description: 'Your points fund the planting of one tree in a reforestation project. Make a real environmental impact!', pointsCost: 200, category: 'donation', stock: -1, isActive: true },
  { name: 'Eco-Friendly Tote Bag', description: 'A durable, reusable tote bag made from 100% recycled materials. Delivered to your doorstep.', pointsCost: 150, category: 'product', stock: 100, isActive: true },
  { name: 'Coffee Voucher', description: 'Enjoy a complimentary coffee at any partner café. Show your redemption code at the counter.', pointsCost: 100, category: 'voucher', stock: 200, isActive: true },
];

const monthsAgo = (n, dayOffset = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(d.getDate() + dayOffset);
  return d;
};

async function upsertCategories() {
  const map = {};
  for (const c of CATEGORIES) {
    const doc = await Category.findOneAndUpdate({ name: c.name }, c, { upsert: true, new: true, setDefaultsOnInsert: true });
    map[c.name] = doc;
  }
  return map;
}

async function upsertUsers() {
  const map = {};
  for (const u of TEST_USERS) {
    let doc = await User.findOne({ email: u.email });
    if (!doc) {
      doc = await User.create({ ...u, password: TEST_PASSWORD, isVerified: true });
      console.log(`  created user ${u.email}`);
    } else {
      console.log(`  reusing existing user ${u.email}`);
    }
    map[u.email] = doc;
  }
  return map;
}

async function resetTestData(userIds) {
  await Listing.deleteMany({ owner: { $in: userIds } });
  await Transaction.deleteMany({ $or: [{ seller: { $in: userIds } }, { buyer: { $in: userIds } }] });
  await Goal.deleteMany({ user: { $in: userIds } });
  await Certificate.deleteMany({ user: { $in: userIds } });
  await User.updateMany({ _id: { $in: userIds } }, { $set: { ecoPoints: 0 } });
}

// Creates a Listing + Transaction pair. If completed=true, marks both as done and
// credits ecoPoints to seller & buyer exactly like transactionController does when
// a transaction is completed through the API.
async function createRecyclingEvent({ seller, buyer, category, weight, date, completed }) {
  const price = Math.round(weight * category.defaultPricePerKg * 100) / 100;
  const listing = await Listing.create({
    title: `${weight}kg of ${category.name}`,
    description: `${weight}kg of ${category.name.toLowerCase()} ready for pickup.`,
    category: category._id,
    weight,
    unit: 'kg',
    price,
    address: '12 Green Road, Dhaka',
    owner: seller._id,
    status: completed ? 'Completed' : 'Pending',
  });

  const pointsEarned = Math.round((category.defaultPointsPerKg || 10) * weight);

  const tx = await Transaction.create({
    listing: listing._id,
    seller: seller._id,
    buyer: buyer._id,
    category: category._id,
    weight,
    unit: 'kg',
    totalAmount: price,
    pointsEarned,
    status: completed ? 'Completed' : 'Pending',
    transactionDate: date,
    history: [{ action: 'Claim', actor: buyer._id, amount: price, date }],
  });

  if (completed) {
    await User.findByIdAndUpdate(seller._id, { $inc: { ecoPoints: pointsEarned } });
    await User.findByIdAndUpdate(buyer._id, { $inc: { ecoPoints: pointsEarned } });
  }

  return tx;
}

async function seedRewardsIfMissing() {
  const existing = await Reward.countDocuments();
  if (existing > 0) {
    console.log(`  ${existing} rewards already exist, skipping.`);
    return;
  }
  await Reward.insertMany(REWARDS);
  console.log(`  seeded ${REWARDS.length} rewards.`);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.\n');

  console.log('Categories:');
  const categories = await upsertCategories();
  console.log(`  ${Object.keys(categories).length} categories ready.\n`);

  console.log('Users:');
  const users = await upsertUsers();
  const userIds = Object.values(users).map((u) => u._id);
  console.log('');

  console.log('Resetting this script\'s previous test data (listings/transactions/goals/certificates)...');
  await resetTestData(userIds);
  console.log('  done.\n');

  const household1 = users['household1@test.com'];
  const household2 = users['household2@test.com'];
  const collector1 = users['collector1@test.com'];
  const business1 = users['business1@test.com'];

  console.log('Creating recycling history for Hasan Household (household1@test.com)...');
  // Spread across 4 months, totalling 120kg -> crosses the 10kg, 50kg and 100kg
  // certificate milestones and gives the Impact Dashboard a real monthly trend.
  await createRecyclingEvent({ seller: household1, buyer: collector1, category: categories['Plastic'], weight: 12, date: monthsAgo(3), completed: true });
  await createRecyclingEvent({ seller: household1, buyer: collector1, category: categories['Paper & Cardboard'], weight: 8, date: monthsAgo(3, 10), completed: true });
  await createRecyclingEvent({ seller: household1, buyer: collector1, category: categories['Metal'], weight: 20, date: monthsAgo(2), completed: true });
  await createRecyclingEvent({ seller: household1, buyer: collector1, category: categories['Glass'], weight: 10, date: monthsAgo(2, 12), completed: true });
  await createRecyclingEvent({ seller: household1, buyer: collector1, category: categories['E-Waste'], weight: 15, date: monthsAgo(1), completed: true });
  await createRecyclingEvent({ seller: household1, buyer: collector1, category: categories['Plastic'], weight: 18, date: monthsAgo(1, 15), completed: true });
  await createRecyclingEvent({ seller: household1, buyer: collector1, category: categories['Metal'], weight: 22, date: monthsAgo(0, 2), completed: true });
  await createRecyclingEvent({ seller: household1, buyer: collector1, category: categories['Paper & Cardboard'], weight: 15, date: monthsAgo(0, 10), completed: true });
  console.log('  120kg across 8 completed transactions.\n');

  console.log('Seeding goals for household1 (progress computes live against the history above)...');
  await Goal.create([
    { user: household1._id, type: 'totalWeight', targetValue: 50, startDate: monthsAgo(4), endDate: monthsAgo(-2) }, // will show as completed (120 >= 50)
    { user: household1._id, type: 'totalWeight', targetValue: 500, startDate: monthsAgo(4), endDate: monthsAgo(-2) }, // active, partial
    { user: household1._id, type: 'categoryWeight', category: categories['Plastic']._id, targetValue: 10, startDate: monthsAgo(4), endDate: monthsAgo(-2) }, // completed (30kg plastic)
  ]);
  console.log('  3 goals created (1 will show completed, 1 active, 1 category-goal completed).\n');

  console.log('Creating a smaller history for Nabila Household (household2@test.com)...');
  // Only 15kg total -> crosses just the first (10kg) certificate milestone.
  await createRecyclingEvent({ seller: household2, buyer: collector1, category: categories['Paper & Cardboard'], weight: 9, date: monthsAgo(1), completed: true });
  await createRecyclingEvent({ seller: household2, buyer: collector1, category: categories['Metal'], weight: 6, date: monthsAgo(0, 5), completed: true });
  // Plus one still-open listing/transaction to populate "My Listings" / "Transactions" with a Pending state.
  await createRecyclingEvent({ seller: household2, buyer: collector1, category: categories['Plastic'], weight: 5, date: new Date(), completed: false });
  console.log('  15kg completed + 1 pending transaction.\n');

  console.log('Creating history for GreenMart Business (business1@test.com)...');
  // 40kg total -> also crosses only the first (10kg) milestone, for a second data point.
  await createRecyclingEvent({ seller: business1, buyer: collector1, category: categories['Metal'], weight: 15, date: monthsAgo(2), completed: true });
  await createRecyclingEvent({ seller: business1, buyer: collector1, category: categories['Glass'], weight: 10, date: monthsAgo(1), completed: true });
  await createRecyclingEvent({ seller: business1, buyer: collector1, category: categories['E-Waste'], weight: 15, date: monthsAgo(0, 3), completed: true });
  console.log('  40kg across 3 completed transactions.\n');

  console.log('Rewards catalog:');
  await seedRewardsIfMissing();
  console.log('');

  console.log('='.repeat(60));
  console.log('Done! Log in with any of these (password for all: ' + TEST_PASSWORD + ')');
  console.log('='.repeat(60));
  console.log(`
  household1@test.com  (household)  -> 120kg recycled, 2,560 EcoPoints, 3 goals
                                        (2 completed, 1 active), certificates unlock
                                        at 10kg/50kg/100kg on first /certificates visit
  household2@test.com  (household)  -> 15kg recycled, 240 EcoPoints, certificate
                                        unlocks at 10kg, plus one pending listing
  business1@test.com   (business)   -> 40kg recycled, 1,205 EcoPoints, certificate
                                        unlocks at 10kg
  collector1@test.com  (collector)  -> buyer on every transaction above, so also
                                        has 175kg recycled, 4,005 EcoPoints, and
                                        certificates of its own (10kg/50kg/100kg)
  admin@test.com        (admin)     -> can manage Categories and Rewards

  Certificates aren't written by this script — they're auto-issued the first time
  each account opens /certificates (or hits GET /api/certificates/mine), matching
  how the feature works for real users.
`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
