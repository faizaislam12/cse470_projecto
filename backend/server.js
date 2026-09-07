require('dotenv').config();

// Node's built-in DNS resolver (c-ares) sometimes ignores the OS-level DNS
// settings on Windows, even after they've been changed correctly — this can
// cause "querySrv ECONNREFUSED" against MongoDB Atlas even when `nslookup`
// works fine from PowerShell. Forcing known-good resolvers here makes the
// app's DNS resolution independent of the machine's network configuration.
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Accept the configured CLIENT_URL plus the common local dev ports, so a
// stale .env value (e.g. left over from switching dev tools) doesn't
// silently block every request with a CORS error.
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin header, e.g. curl/Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'GreenLoop API is running' }));

// --- Member 1 stack: core SRS features (auth, listings, categories, prices, transactions, feedback) ---
app.use('/api/auth', authRoutes);
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/prices', require('./routes/priceRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// --- Member 2 (fi) stack: offers & counter-offers on the marketplace ---
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/pickups', require('./routes/pickupRoutes'));

// --- Member 3 (adrita) stack: rewards, eco points, impact, goals, certificates ---
app.use('/api/ecopoints', require('./routes/ecoPointsRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/redemptions', require('./routes/redemptionRoutes'));
app.use('/api/impact', require('./routes/impactRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));