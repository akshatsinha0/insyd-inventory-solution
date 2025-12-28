/*
 * 1.) Authentication Routes for User Management.
 * 2.) Implemented Supabase Auth integration.
 * 3.) Supported signup, login, and session management.
 * 4.) Used JWT tokens for session persistence.
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

/*
 * 1.) User Signup Endpoint.
 * 2.) Created new user with email and password.
 * 3.) Stored additional user metadata in profiles table.
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) throw error;

    res.status(201).json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      },
      token: data.session?.access_token
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/*
 * 1.) User Login Endpoint.
 * 2.) Authenticated user with email and password.
 * 3.) Returned JWT token for session management.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      },
      token: data.session?.access_token
    });

  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

/*
 * 1.) User Logout Endpoint.
 * 2.) Invalidated current session.
 */
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
 * 1.) Get Current User Endpoint.
 * 2.) Returned authenticated user details.
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    res.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      }
    });

  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;
