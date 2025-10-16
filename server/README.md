GoatFun Backend (Socket.io + Express + MongoDB)

Socket-only backend for GoatFun prediction markets. All actions happen via Socket.io events; no REST routes.

Setup
- cd backend
- Create .env (PORT, MONGO_URI, CORS_ORIGIN)
- npm i
- npm run dev

Socket Events
- user_connect { wallet, username? }
- create_market { creator, title, ticker, description?, media?, banner?, socialLinks?, durationHours }
- join_market { marketId, wallet, side: 'bullish'|'fade', shares }
- start_stream { marketId }
- stop_stream { marketId }
- end_market { marketId, finalResult? }
- get_markets {}
- get_market_detail { marketId }

Server Events
- market_created { marketId }
- market_update { marketId, bullishSupply, fadeSupply, bullishPrice, fadePrice, poolBalance }
- stream_update { marketId, isLive }

Notes
- Bonding curve: price = 1 + 0.05 * sqrt(supply)
- Creator fee: 5%
- Expiry job finalizes markets when endTime passes

Cloudinary
- Add to .env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, DEFAULT_AVATAR_URL
- One-time upload default avatar: npm run dev (or ts-node) src/scripts/uploadDefaultAvatar.ts → copy printed URL to DEFAULT_AVATAR_URL
- Socket: upload_avatar { wallet, data, filename } → saves Cloudinary URL to user.avatarUrl

