// Express app skeleton for Creo Creator Backend
// This app provides endpoints for creating posts, likes, follows, comments and discount requests.
// NOTE: This is a minimal example and is not ready for production use.

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

// In-memory store (replace with real database in production)
const posts = [];
const likes = [];
const follows = [];
const comments = [];
const discountRequests = [];

const app = express();
app.use(bodyParser.json());

// Enable CORS for cross-origin requests from Shopify theme or other domains
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper: generate simple IDs
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// POST /proxy/posts - create a new post
app.post('/proxy/posts', (req, res) => {
  const { creatorId, mediaUrl, text, productId } = req.body;
  const id = generateId();
  const post = { id, creatorId, mediaUrl, text, productId, createdAt: new Date().toISOString() };
  posts.push(post);
  res.status(201).json(post);
});

// GET /proxy/posts - list posts (optionally filtered by creatorId)
app.get('/proxy/posts', (req, res) => {
  const { creatorId } = req.query;
  if (creatorId) {
    return res.json(posts.filter(post => post.creatorId === creatorId));
  }
  return res.json(posts);
});

// POST /proxy/like - like or unlike a post
app.post('/proxy/like', (req, res) => {
  const { postId, customerId } = req.body;
  // toggle like
  const index = likes.findIndex(like => like.postId === postId && like.customerId === customerId);
  if (index >= 0) {
    likes.splice(index, 1);
    return res.json({ liked: false });
  }
  likes.push({ id: generateId(), postId, customerId });
  return res.json({ liked: true });
});

// GET /proxy/likes - get like count for a post
app.get('/proxy/likes', (req, res) => {
  const { postId } = req.query;
  const count = likes.filter(like => like.postId === postId).length;
  res.json({ count });
});

// POST /proxy/follow - follow or unfollow a creator
app.post('/proxy/follow', (req, res) => {
  const { creatorId, customerId } = req.body;
  const index = follows.findIndex(f => f.creatorId === creatorId && f.customerId === customerId);
  if (index >= 0) {
    follows.splice(index, 1);
    return res.json({ following: false });
  }
  follows.push({ id: generateId(), creatorId, customerId });
  return res.json({ following: true });
});

// GET /proxy/follows - get followers count for a creator
app.get('/proxy/follows', (req, res) => {
  const { creatorId } = req.query;
  const count = follows.filter(f => f.creatorId === creatorId).length;
  res.json({ count });
});

// POST /proxy/comments - add a comment to a post
app.post('/proxy/comments', (req, res) => {
  const { postId, customerId, body } = req.body;
  const comment = { id: generateId(), postId, customerId, body, createdAt: new Date().toISOString() };
  comments.push(comment);
  res.status(201).json(comment);
});

// GET /proxy/comments - list comments for a post
app.get('/proxy/comments', (req, res) => {
  const { postId } = req.query;
  res.json(comments.filter(c => c.postId === postId));
});

// POST /proxy/discounts - request a discount (creates a price rule via Shopify API)
app.post('/proxy/discounts', async (req, res) => {
  const { creatorId, productId, type, value, startsAt, endsAt } = req.body;
  // Save request
  const discountReq = { id: generateId(), creatorId, productId, type, value, startsAt, endsAt, status: 'pending' };
  discountRequests.push(discountReq);

  // Example call to Shopify API (requires environment variables for shop and admin token)
  try {
    const shop = process.env.SHOP;
    const token = process.env.ADMIN_TOKEN;
    const priceRule = {
      price_rule: {
        title: `Creator Discount ${discountReq.id}`,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: type === 'percent' ? 'percentage' : 'fixed_amount',
        value: type === 'percent' ? `-${value}` : `-${Number(value).toFixed(2)}`,
        starts_at: startsAt,
        ends_at: endsAt
      }
    };
    const resp = await fetch(`https://${shop}/admin/api/2024-07/price_rules.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(priceRule)
    });
    const data = await resp.json();
    discountReq.status = 'created';
    return res.json({ discountReq, priceRule: data });
  } catch (err) {
    console.error(err);
    discountReq.status = 'failed';
    return res.status(500).json({ error: 'Failed to create discount' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Creo Creator App listening on port ${PORT}`);
});
