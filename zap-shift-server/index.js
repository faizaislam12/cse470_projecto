const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Some Windows setups point Node's resolver at a local DNS proxy that
// refuses SRV queries, breaking mongodb+srv:// lookups. Force public
// resolvers so the Atlas SRV record resolves reliably.
require("dns").setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fcjsi2p.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Collection handles can be created before the connection resolves; the
// driver queues operations until connect() succeeds. Routes are registered
// unconditionally below so a DB outage returns clean per-request errors
// instead of taking down every route (including "/") with it.
const db = client.db("zap_shift_db");

const usersCollection = db.collection("users");
const businessesCollection = db.collection("businesses");
const campaignsCollection = db.collection("campaigns");
const campaignParticipantsCollection = db.collection("campaignParticipants");
const notificationsCollection = db.collection("notifications");
const collectorsCollection = db.collection("collectors");
const pickupsCollection = db.collection("pickups");
const transactionsCollection = db.collection("transactions");
const parcelsCollection = db.collection("parcels");

// Used by other routes to fire a notification without duplicating insert
// logic. userId is expected to be the Firebase uid.
async function createNotification({ userId, title, message, type, relatedId = null }) {
  if (!userId) return;

  await notificationsCollection.insertOne({
    userId,
    title,
    message,
    type,
    relatedId,
    isRead: false,
    createdAt: new Date(),
  });
}

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
  res.send("GreenLoop Server Running...");
});

app.get("/test", (req, res) => {
  res.send({
    success: true,
  });
});

// ==========================================
// USERS
// ==========================================

app.post("/users", async (req, res) => {
  // Date objects serialize to ISO strings over JSON, so a client-sent
  // createdAt would land as a plain string and break date aggregations
  // (e.g. User Growth). Always stamp it server-side instead.
  const user = { ...req.body, createdAt: new Date() };

  const existingUser = await usersCollection.findOne({
    email: user.email,
  });

  if (existingUser) {
    return res.send({
      message: "User already exists",
      insertedId: null,
    });
  }

  const result = await usersCollection.insertOne(user);

  res.send(result);
});

app.get("/users", async (req, res) => {
  const result = await usersCollection.find().toArray();

  res.send(result);
});

// Get All Users
app.get("/all-users", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

// Update User Role
app.patch("/users/role/:id", async (req, res) => {
  const id = req.params.id;
  const role = req.body.role;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid user id" });
  }

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        role,
      },
    }
  );

  res.send(result);
});

app.get("/users/:email", async (req, res) => {
  const email = req.params.email;

  const result = await usersCollection.findOne({
    email: email,
  });

  res.send(result);
});

// Update Profile Name
app.patch("/users/name/:id", async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid user id" });
  }

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        name,
      },
    }
  );

  res.send(result);
});

// ==========================================
// BUSINESS ACCOUNTS
// ==========================================

// Self-service create (Business role registers their own profile)
app.post("/businesses", async (req, res) => {
  const business = {
    ...req.body,
    status: "Pending",
    totalRecycled: 0,
    createdAt: new Date(),
  };

  const result = await businessesCollection.insertOne(business);

  res.send(result);
});

app.get("/businesses", async (req, res) => {
  const result = await businessesCollection
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  res.send(result);
});

// Current user's own business profile
app.get("/businesses/user/:userId", async (req, res) => {
  const result = await businessesCollection.findOne({
    userId: req.params.userId,
  });

  res.send(result);
});

// Owner edits their own profile fields
app.patch("/businesses/profile/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid business id" });
  }

  const { businessName, businessType, phone, address, logo, description } =
    req.body;

  const result = await businessesCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        businessName,
        businessType,
        phone,
        address,
        logo,
        description,
      },
    }
  );

  res.send(result);
});

// Admin sets status (Approved/Rejected/Suspended)
app.patch("/businesses/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid business id" });
  }

  const business = await businessesCollection.findOne({
    _id: new ObjectId(id),
  });

  const result = await businessesCollection.updateOne(
    {
      _id: new ObjectId(id),
    },
    {
      $set: {
        status: req.body.status,
      },
    }
  );

  const statusMessages = {
    Approved: "Your business profile has been approved.",
    Rejected: "Your business profile was rejected.",
    Suspended: "Your business account has been suspended.",
  };

  if (business?.userId) {
    await createNotification({
      userId: business.userId,
      title: `Business ${req.body.status}`,
      message:
        statusMessages[req.body.status] ||
        `Your business status is now ${req.body.status}.`,
      type: "SYSTEM",
      relatedId: id,
    });
  }

  res.send(result);
});

// Admin delete
app.delete("/businesses/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid business id" });
  }

  const result = await businessesCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});

// Activity / transaction history for one business
app.get("/businesses/:id/transactions", async (req, res) => {
  const result = await transactionsCollection
    .find({ businessId: req.params.id })
    .sort({ createdAt: -1 })
    .toArray();

  res.send(result);
});

// ==========================================
// TRANSACTIONS
// ==========================================

app.post("/transactions", async (req, res) => {
  const transaction = {
    ...req.body,
    createdAt: new Date(),
  };

  const result = await transactionsCollection.insertOne(transaction);

  const totalAgg = await transactionsCollection
    .aggregate([
      { $match: { businessId: req.body.businessId } },
      { $group: { _id: null, totalWeight: { $sum: "$weightKg" } } },
    ])
    .toArray();

  const totalRecycled = totalAgg[0]?.totalWeight || 0;

  if (ObjectId.isValid(req.body.businessId)) {
    await businessesCollection.updateOne(
      { _id: new ObjectId(req.body.businessId) },
      { $set: { totalRecycled } }
    );
  }

  res.send(result);
});

// ==========================================
// COLLECTOR PERFORMANCE
// ==========================================

app.get("/collectors", async (req, res) => {
  const result = await collectorsCollection.find().toArray();

  res.send(result);
});

app.post("/collectors", async (req, res) => {
  const collector = {
    ...req.body,
    status: req.body.status || "Active",
    createdAt: new Date(),
  };

  const result = await collectorsCollection.insertOne(collector);

  res.send(result);
});

// Current collector's own record — the admin-side "Add Collector" form only
// captures an email (not a Firebase uid) to link a collector to their
// account, so the lookup key is email.
app.get("/collectors/email/:email", async (req, res) => {
  const result = await collectorsCollection.findOne({
    email: req.params.email,
  });

  res.send(result);
});

// Aggregated performance stats for one collector, computed from pickups
app.get("/collectors/:id/stats", async (req, res) => {
  const collectorId = req.params.id;

  const statusCounts = await pickupsCollection
    .aggregate([
      { $match: { collectorId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          weight: { $sum: "$weightKg" },
          earnings: { $sum: "$earnings" },
        },
      },
    ])
    .toArray();

  let completed = 0;
  let pending = 0;
  let cancelled = 0;
  let totalWeight = 0;
  let totalEarnings = 0;

  statusCounts.forEach((s) => {
    if (s._id === "Completed") {
      completed = s.count;
      totalWeight += s.weight;
      totalEarnings += s.earnings;
    } else if (s._id === "Pending") {
      pending = s.count;
    } else if (s._id === "Cancelled") {
      cancelled = s.count;
    }
  });

  const wasteByMaterialRaw = await pickupsCollection
    .aggregate([
      { $match: { collectorId, status: "Completed" } },
      { $group: { _id: "$materialType", weightKg: { $sum: "$weightKg" } } },
    ])
    .toArray();

  const monthlyRaw = await pickupsCollection
    .aggregate([
      { $match: { collectorId, status: "Completed" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$pickupDate" } },
          earnings: { $sum: "$earnings" },
          pickups: { $sum: 1 },
          weight: { $sum: "$weightKg" },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = monthlyRaw.find((m) => m._id === monthKey);

  const totalPickups = completed + pending + cancelled;
  // Success Rate = Completed Pickups / Total Assigned Pickups × 100
  const successRate = totalPickups
    ? Math.round((completed / totalPickups) * 1000) / 10
    : 0;

  res.send({
    totalPickups,
    completed,
    pending,
    cancelled,
    successRate,
    totalWeight,
    totalEarnings,
    wasteByMaterial: wasteByMaterialRaw.map((w) => ({
      material: w._id,
      weightKg: w.weightKg,
    })),
    monthlyEarnings: monthlyRaw.map((m) => ({
      month: m._id,
      earnings: m.earnings,
      pickups: m.pickups,
      weight: m.weight,
    })),
    thisMonth: {
      pickups: thisMonth?.pickups || 0,
      weight: thisMonth?.weight || 0,
      earnings: thisMonth?.earnings || 0,
    },
  });
});

// Admin-wide collector overview + leaderboard
app.get("/collector-stats-overview", async (req, res) => {
  const totalCollectors = await collectorsCollection.countDocuments();
  const activeCollectors = await collectorsCollection.countDocuments({
    status: "Active",
  });

  const pickupStatusCounts = await pickupsCollection
    .aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          weight: { $sum: "$weightKg" },
        },
      },
    ])
    .toArray();

  let totalPickups = 0;
  let completedPickups = 0;
  let cancelledPickups = 0;
  let totalWaste = 0;

  pickupStatusCounts.forEach((s) => {
    totalPickups += s.count;
    if (s._id === "Completed") {
      completedPickups = s.count;
      totalWaste = s.weight;
    } else if (s._id === "Cancelled") {
      cancelledPickups = s.count;
    }
  });

  // Success Rate = Completed Pickups / Total Assigned Pickups × 100
  const overallSuccessRate = totalPickups
    ? Math.round((completedPickups / totalPickups) * 1000) / 10
    : 0;

  const ratingAgg = await collectorsCollection
    .aggregate([{ $group: { _id: null, avgRating: { $avg: "$rating" } } }])
    .toArray();

  const avgRating = ratingAgg[0]?.avgRating || 0;

  const collectors = await collectorsCollection.find().toArray();

  const leaderboard = await Promise.all(
    collectors.map(async (c) => {
      const [completedCount, assignedCount] = await Promise.all([
        pickupsCollection.countDocuments({
          collectorId: c._id.toString(),
          status: "Completed",
        }),
        pickupsCollection.countDocuments({
          collectorId: c._id.toString(),
        }),
      ]);

      return {
        _id: c._id,
        name: c.name,
        rating: c.rating || 0,
        completedPickups: completedCount,
        successRate: assignedCount
          ? Math.round((completedCount / assignedCount) * 1000) / 10
          : 0,
      };
    })
  );

  leaderboard.sort((a, b) => b.completedPickups - a.completedPickups);

  res.send({
    totalCollectors,
    activeCollectors,
    totalPickups,
    completedPickups,
    cancelledPickups,
    successRate: overallSuccessRate,
    avgRating: Math.round(avgRating * 10) / 10,
    totalWaste,
    leaderboard: leaderboard.slice(0, 10),
  });
});

// ==========================================
// PICKUPS
// ==========================================

app.post("/pickups", async (req, res) => {
  const pickup = {
    ...req.body,
    pickupDate: new Date(req.body.pickupDate),
    createdAt: new Date(),
  };

  const result = await pickupsCollection.insertOne(pickup);

  res.send(result);
});

// ==========================================
// CAMPAIGNS
// ==========================================

app.get("/campaigns", async (req, res) => {
  const result = await campaignsCollection
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  res.send(result);
});

app.post("/campaigns", async (req, res) => {
  const campaign = {
    title: req.body.title,
    description: req.body.description,
    image: req.body.image || "",
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
    targetWeight: Number(req.body.targetWeight),
    currentWeight: 0,
    createdBy: req.body.createdBy,
    status: "Upcoming",
    createdAt: new Date(),
  };

  const result = await campaignsCollection.insertOne(campaign);

  const users = await usersCollection.find({ uid: { $exists: true } }).toArray();

  await Promise.all(
    users.map((u) =>
      createNotification({
        userId: u.uid,
        title: "New Campaign",
        message: `${campaign.title} has been created. Join now!`,
        type: "CAMPAIGN",
        relatedId: result.insertedId.toString(),
      })
    )
  );

  res.send(result);
});

app.patch("/campaigns/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid campaign id" });
  }

  const { title, description, image, startDate, endDate, targetWeight } =
    req.body;

  const result = await campaignsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        title,
        description,
        image,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetWeight: Number(targetWeight),
      },
    }
  );

  res.send(result);
});

app.patch("/campaigns/:id/status", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid campaign id" });
  }

  const status = req.body.status;

  const campaign = await campaignsCollection.findOne({
    _id: new ObjectId(id),
  });

  const result = await campaignsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status } }
  );

  if (status === "Active" && campaign) {
    const users = await usersCollection
      .find({ uid: { $exists: true } })
      .toArray();

    await Promise.all(
      users.map((u) =>
        createNotification({
          userId: u.uid,
          title: "Campaign Started",
          message: `${campaign.title} has started!`,
          type: "CAMPAIGN",
          relatedId: id,
        })
      )
    );
  }

  res.send(result);
});

app.delete("/campaigns/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid campaign id" });
  }

  const result = await campaignsCollection.deleteOne({
    _id: new ObjectId(id),
  });

  await campaignParticipantsCollection.deleteMany({ campaignId: id });

  res.send(result);
});

app.post("/campaigns/:id/join", async (req, res) => {
  const campaignId = req.params.id;
  const { userId, name, email, role, isSponsor } = req.body;

  const existing = await campaignParticipantsCollection.findOne({
    campaignId,
    userId,
  });

  if (existing) {
    return res.send({ message: "Already joined", insertedId: null });
  }

  const result = await campaignParticipantsCollection.insertOne({
    campaignId,
    userId,
    name,
    email,
    role,
    isSponsor: !!isSponsor,
    contributionKg: 0,
    joinedAt: new Date(),
  });

  if (ObjectId.isValid(campaignId)) {
    const campaign = await campaignsCollection.findOne({
      _id: new ObjectId(campaignId),
    });

    await createNotification({
      userId,
      title: "Joined Campaign",
      message: `You joined ${campaign?.title || "the campaign"}.`,
      type: "CAMPAIGN",
      relatedId: campaignId,
    });
  }

  res.send(result);
});

app.post("/campaigns/:id/leave", async (req, res) => {
  const campaignId = req.params.id;
  const { userId } = req.body;

  const result = await campaignParticipantsCollection.deleteOne({
    campaignId,
    userId,
  });

  res.send(result);
});

app.get("/campaigns/:id/participants", async (req, res) => {
  const result = await campaignParticipantsCollection
    .find({ campaignId: req.params.id })
    .sort({ joinedAt: -1 })
    .toArray();

  res.send(result);
});

app.patch("/campaigns/:id/contribute", async (req, res) => {
  const campaignId = req.params.id;
  const { userId, weightKg } = req.body;
  const weight = Number(weightKg);

  await campaignParticipantsCollection.updateOne(
    { campaignId, userId },
    { $inc: { contributionKg: weight } }
  );

  let campaign = null;

  if (ObjectId.isValid(campaignId)) {
    await campaignsCollection.updateOne(
      { _id: new ObjectId(campaignId) },
      { $inc: { currentWeight: weight } }
    );

    campaign = await campaignsCollection.findOne({
      _id: new ObjectId(campaignId),
    });
  }

  await createNotification({
    userId,
    title: "Contribution Logged",
    message: `Thanks for contributing ${weight} kg to ${campaign?.title || "the campaign"}!`,
    type: "REWARD",
    relatedId: campaignId,
  });

  res.send({ success: true });
});

// ==========================================
// NOTIFICATIONS
// ==========================================

app.get("/notifications", async (req, res) => {
  const result = await notificationsCollection
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  res.send(result);
});

app.post("/notifications", async (req, res) => {
  const { userId, broadcast, title, message, type, relatedId } = req.body;

  if (broadcast) {
    const users = await usersCollection
      .find({ uid: { $exists: true } })
      .toArray();

    const docs = users.map((u) => ({
      userId: u.uid,
      title,
      message,
      type: type || "SYSTEM",
      relatedId: relatedId || null,
      isRead: false,
      createdAt: new Date(),
    }));

    const result = docs.length
      ? await notificationsCollection.insertMany(docs)
      : { insertedCount: 0 };

    return res.send(result);
  }

  const result = await notificationsCollection.insertOne({
    userId,
    title,
    message,
    type: type || "SYSTEM",
    relatedId: relatedId || null,
    isRead: false,
    createdAt: new Date(),
  });

  res.send(result);
});

app.get("/notifications/user/:userId", async (req, res) => {
  const result = await notificationsCollection
    .find({ userId: req.params.userId })
    .sort({ createdAt: -1 })
    .toArray();

  res.send(result);
});

app.patch("/notifications/:id/read", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid notification id" });
  }

  const result = await notificationsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { isRead: true } }
  );

  res.send(result);
});

app.patch("/notifications/read-all/:userId", async (req, res) => {
  const result = await notificationsCollection.updateMany(
    { userId: req.params.userId, isRead: false },
    { $set: { isRead: true } }
  );

  res.send(result);
});

app.delete("/notifications/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid notification id" });
  }

  const result = await notificationsCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});

// ==========================================
// PARCELS
// ==========================================

app.get("/parcels", async (req, res) => {
  const result = await parcelsCollection.find().toArray();

  res.send(result);
});

app.post("/parcels", async (req, res) => {
  const result = await parcelsCollection.insertOne(req.body);

  res.send(result);
});

// ==========================================
// ADMIN ANALYTICS
// ==========================================

app.get("/admin-analytics", async (req, res) => {
  const totalUsers = await usersCollection.countDocuments();
  const totalCollectors = await collectorsCollection.countDocuments();
  const totalBusinesses = await businessesCollection.countDocuments();
  const totalTransactions = await transactionsCollection.countDocuments();
  const activeCampaigns = await campaignsCollection.countDocuments({
    status: "Active",
  });

  const pickupAgg = await pickupsCollection
    .aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: null,
          totalWaste: { $sum: "$weightKg" },
          completedPickups: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const totalWaste = pickupAgg[0]?.totalWaste || 0;
  const completedPickups = pickupAgg[0]?.completedPickups || 0;
  const cancelledPickups = await pickupsCollection.countDocuments({
    status: "Cancelled",
  });

  const mostActiveCollectorAgg = await pickupsCollection
    .aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: "$collectorId", completed: { $sum: 1 } } },
      { $sort: { completed: -1 } },
      { $limit: 1 },
    ])
    .toArray();

  let mostActiveCollector = null;
  if (mostActiveCollectorAgg[0] && ObjectId.isValid(mostActiveCollectorAgg[0]._id)) {
    const collector = await collectorsCollection.findOne({
      _id: new ObjectId(mostActiveCollectorAgg[0]._id),
    });
    mostActiveCollector = {
      name: collector?.name || "Unknown",
      completedPickups: mostActiveCollectorAgg[0].completed,
    };
  }

  const mostActiveBusinessAgg = await transactionsCollection
    .aggregate([
      { $group: { _id: "$businessId", transactions: { $sum: 1 } } },
      { $sort: { transactions: -1 } },
      { $limit: 1 },
    ])
    .toArray();

  let mostActiveBusiness = null;
  if (mostActiveBusinessAgg[0] && ObjectId.isValid(mostActiveBusinessAgg[0]._id)) {
    const business = await businessesCollection.findOne({
      _id: new ObjectId(mostActiveBusinessAgg[0]._id),
    });
    mostActiveBusiness = {
      name: business?.businessName || "Unknown",
      transactions: mostActiveBusinessAgg[0].transactions,
    };
  }

  const revenueAgg = await transactionsCollection
    .aggregate([{ $group: { _id: null, revenue: { $sum: "$amount" } } }])
    .toArray();

  const revenue = revenueAgg[0]?.revenue || 0;

  // Placeholder until the real EcoPoints Reward System (Feature 10) exists.
  const ecoPointsIssued = Math.round(totalWaste * 10);

  const userGrowthRaw = await usersCollection
    .aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  let cumulative = 0;
  const userGrowth = userGrowthRaw.map((m) => {
    cumulative += m.count;
    return { month: m._id, users: cumulative };
  });

  const wasteByMaterialRaw = await pickupsCollection
    .aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: "$materialType", weightKg: { $sum: "$weightKg" } } },
    ])
    .toArray();

  const wasteByMaterial = wasteByMaterialRaw.map((w) => ({
    material: w._id,
    weightKg: w.weightKg,
  }));

  const mostRecycledMaterial = wasteByMaterial.length
    ? [...wasteByMaterial].sort((a, b) => b.weightKg - a.weightKg)[0]
    : null;

  const userDistributionRaw = await usersCollection
    .aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
    .toArray();

  const userDistribution = userDistributionRaw.map((r) => ({
    role: r._id || "Unknown",
    count: r.count,
    percent: totalUsers ? Math.round((r.count / totalUsers) * 100) : 0,
  }));

  const transactionsByMonthRaw = await transactionsCollection
    .aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  const transactionsByMonth = transactionsByMonthRaw.map((t) => ({
    month: t._id,
    count: t.count,
  }));

  const campaigns = await campaignsCollection.find().toArray();

  const campaignPerformance = campaigns.map((c) => ({
    title: c.title,
    targetWeight: c.targetWeight || 0,
    currentWeight: c.currentWeight || 0,
  }));

  res.send({
    totals: {
      users: totalUsers,
      collectors: totalCollectors,
      businesses: totalBusinesses,
      totalWaste,
      completedPickups,
      cancelledPickups,
      transactions: totalTransactions,
      ecoPointsIssued,
      activeCampaigns,
      revenue,
    },
    topPerformers: {
      mostActiveCollector,
      mostActiveBusiness,
      mostRecycledMaterial,
    },
    userGrowth,
    wasteByMaterial,
    userDistribution,
    transactionsByMonth,
    campaignPerformance,
  });
});

// ==========================================
// DASHBOARD STATS
// ==========================================

app.get("/dashboard-stats", async (req, res) => {
  const totalUsers = await usersCollection.countDocuments();

  const totalBusinesses = await businessesCollection.countDocuments();

  const pendingBusinesses = await businessesCollection.countDocuments({
    status: "Pending",
  });

  const approvedBusinesses = await businessesCollection.countDocuments({
    status: "Approved",
  });

  const totalCampaigns = await campaignsCollection.countDocuments();

  const totalNotifications = await notificationsCollection.countDocuments();

  res.send({
    totalUsers,
    totalBusinesses,
    pendingBusinesses,
    approvedBusinesses,
    totalCampaigns,
    totalNotifications,
  });
});

// ==========================================
// ERROR HANDLER (must stay after all routes)
// ==========================================

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).send({ message: "Something went wrong" });
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
}

run();

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
