const jwt = require('jsonwebtoken');

// Short-lived access token, carried by the client and sent as Bearer token
const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

// Long-lived refresh token, stored in an httpOnly cookie
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  const cookieExpiresDays = parseInt(process.env.JWT_COOKIE_EXPIRES_DAYS, 10) || 1;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: user.toSafeObject(),
  });
};

module.exports = { generateAccessToken, generateRefreshToken, sendTokenResponse };
