# Creo Creator App

This repository contains a basic backend skeleton for the **Creator Portal** of the Creo platform. It is intended as a starting point for a custom Node.js app that powers social features such as posts, likes, follows, comments and discount requests for creators.

## Overview

The app uses **Express.js** and provides the following endpoints under a proxy path (e.g. `/proxy/*` when configured via Shopify App Proxy):

| Endpoint | Description |
| --- | --- |
| `POST /proxy/posts` | Create a new post associated with a creator and optional product. |
| `GET /proxy/posts` | Retrieve all posts or filter by `creatorId`. |
| `POST /proxy/like` | Like or unlike a post (toggle). |
| `GET /proxy/likes` | Get the number of likes for a post. |
| `POST /proxy/follow` | Follow or unfollow a creator (toggle). |
| `GET /proxy/follows` | Get the number of followers for a creator. |
| `POST /proxy/comments` | Add a comment to a post. |
| `GET /proxy/comments` | Retrieve all comments for a post. |
| `POST /proxy/discounts` | Request a discount for a product; creates a Shopify price rule via API (needs environment variables). |

All data is stored in memory for demonstration purposes. In a real implementation you should replace the in‑memory arrays with a persistent database (e.g. PostgreSQL, Supabase, Firestore, etc.).

## Getting Started

1. Install dependencies:

```bash
npm install express body-parser node-fetch
```

2. Set environment variables for Shopify access when testing discount creation:

```
SHOP=myshop.myshopify.com
ADMIN_TOKEN=shpat_xxxxxxxxxxxxxxxxxx
PORT=3000
```

3. Start the server:

```bash
node server.js
```

You can then test the endpoints locally (e.g. with `curl` or Postman). When deployed behind a Shopify App Proxy, the base path will include your proxy prefix.

## License

This code is provided as a starting point and is not production ready. You may modify and use it under the terms of the MIT license.