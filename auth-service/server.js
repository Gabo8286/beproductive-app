const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9999;

// JWT secret must match PostgREST configuration
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'supabase-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Generate JWT token
function generateToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: 'authenticated',
    aud: 'authenticated',
    iss: 'supabase-demo',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'local-auth' });
});

// Sign up endpoint
app.post('/auth/v1/signup', async (req, res) => {
  try {
    const { email, password, options = {} } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM auth.users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'signup_disabled',
        error_description: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user
    await pool.query(
      `INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
       VALUES ($1, $2, $3, NOW(), NOW(), NOW(), $4)`,
      [userId, email, hashedPassword, JSON.stringify(options.data || {})]
    );

    // Create profile
    await pool.query(
      `INSERT INTO public.profiles (id, email, full_name, role, onboarding_completed)
       VALUES ($1, $2, $3, 'user', false)`,
      [userId, email, options.data?.full_name || '']
    );

    const user = {
      id: userId,
      email: email,
      created_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      user_metadata: options.data || {}
    };

    const token = generateToken(user);

    res.json({
      access_token: token,
      token_type: 'bearer',
      expires_in: 86400,
      refresh_token: token, // Simplified - using same token
      user: user
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error'
    });
  }
});

// Sign in endpoint
app.post('/auth/v1/token', async (req, res) => {
  try {
    const { email, password, grant_type } = req.body;

    if (grant_type !== 'password') {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only password grant type is supported'
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Email and password are required'
      });
    }

    // Get user from database
    const userResult = await pool.query(
      'SELECT id, email, encrypted_password, created_at, email_confirmed_at, raw_user_meta_data FROM auth.users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        error: 'invalid_credentials',
        error_description: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // For development, allow login without password check for admin user
    let isValidPassword = false;
    if (email === 'gabotico82@gmail.com') {
      isValidPassword = true; // Skip password check for admin in dev
    } else if (user.encrypted_password) {
      isValidPassword = await bcrypt.compare(password, user.encrypted_password);
    }

    if (!isValidPassword) {
      return res.status(400).json({
        error: 'invalid_credentials',
        error_description: 'Invalid email or password'
      });
    }

    const authUser = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at || new Date().toISOString(),
      user_metadata: user.raw_user_meta_data || {}
    };

    const token = generateToken(authUser);

    res.json({
      access_token: token,
      token_type: 'bearer',
      expires_in: 86400,
      refresh_token: token, // Simplified - using same token
      user: authUser
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error'
    });
  }
});

// Get user endpoint
app.get('/auth/v1/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'No valid token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const userResult = await pool.query(
      'SELECT id, email, created_at, email_confirmed_at, raw_user_meta_data FROM auth.users WHERE id = $1',
      [decoded.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'user_not_found',
        error_description: 'User not found'
      });
    }

    const user = userResult.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      user_metadata: user.raw_user_meta_data || {}
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      error: 'invalid_token',
      error_description: 'Invalid or expired token'
    });
  }
});

// Refresh token endpoint
app.post('/auth/v1/token', async (req, res) => {
  if (req.body.grant_type === 'refresh_token') {
    try {
      const { refresh_token } = req.body;
      const decoded = jwt.verify(refresh_token, JWT_SECRET);

      const userResult = await pool.query(
        'SELECT id, email, created_at, email_confirmed_at, raw_user_meta_data FROM auth.users WHERE id = $1',
        [decoded.sub]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'user_not_found',
          error_description: 'User not found'
        });
      }

      const user = userResult.rows[0];
      const newToken = generateToken({
        id: user.id,
        email: user.email
      });

      res.json({
        access_token: newToken,
        token_type: 'bearer',
        expires_in: 86400,
        refresh_token: newToken,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          user_metadata: user.raw_user_meta_data || {}
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid refresh token'
      });
    }
  }
});

// Sign out endpoint
app.post('/auth/v1/logout', (req, res) => {
  res.json({ message: 'Successfully logged out' });
});

// Settings endpoint (for compatibility)
app.get('/auth/v1/settings', (req, res) => {
  res.json({
    external_email_enabled: true,
    external_phone_enabled: false,
    disable_signup: false,
    autoconfirm: true
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Local auth service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down auth service...');
  await pool.end();
  process.exit(0);
});