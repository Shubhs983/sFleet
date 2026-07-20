# SFleet — Real-Time Delivery & Ride Tracking Backend

A real-time ride and delivery tracking backend built around one priority: making every journey visible and accountable, for both rider and driver, from request to drop-off. Designed with a particular focus on safer travel for women — especially at night — SFleet lets customers track their ride live, and gives drivers a transparent, structured way to manage requests through a complete ride lifecycle.

## What It Does

- Customers and drivers can **sign up and log in** securely (JWT-based authentication)
- Customers can **find nearby available drivers** using geospatial location queries
- Customers can **create a ride/delivery request**
- Drivers can **accept requests** and **update the order status** as it progresses
- Status changes and driver location are **pushed to the customer in real time** via WebSockets — no refreshing needed
- Customers can **rate a completed ride** and view their **ride history**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Real-time | Socket.io |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |

## Why These Technologies

- **MongoDB's geospatial `2dsphere` index** was used to efficiently find nearby drivers within a radius — a natural fit for location-based matching, something a relational database handles far less elegantly.
- **Socket.io** enables real-time, two-way communication so customers see driver location and order status changes instantly, instead of repeatedly polling the server.
- **Room-based broadcasting** (one Socket.io "room" per order) ensures updates for a specific ride only reach that ride's customer and driver — not every connected user.
- **JWT** allows stateless authentication — the server doesn't need to store session data, and tokens carry the user's identity and role with them.

## Getting Started

### Prerequisites
- Node.js installed
- A MongoDB Atlas account (or local MongoDB instance)

### Installation

```bash
git clone <your-repo-url>
cd delivery-tracker
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
MONGO_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_secret_key
```

### Run the Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user (customer or driver) |
| POST | `/api/auth/login` | Log in and receive a JWT token |

### Driver
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/driver/update-location` | Update the logged-in driver's live location |
| GET | `/api/driver/nearby` | Find available drivers near a given location |

### Order
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/order/create` | Create a new ride/delivery request |
| PATCH | `/api/order/:orderId/status` | Update an order's status (accepted → picked_up → in_transit → completed) |
| PATCH | `/api/order/:orderId/rate` | Rate and review a completed order |
| GET | `/api/order/my-orders` | Get the logged-in user's order history (customer or driver) |

*All routes except signup/login require a JWT token in the `Authorization` header.*

## Real-Time Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|--------------|
| `ride:join` | Client → Server | Client joins a room for a specific order |
| `driver:updateLocation` | Client → Server | Driver sends live GPS coordinates |
| `driver:locationUpdated` | Server → Client | Broadcasts driver's new location to that order's room |
| `order:statusUpdated` | Server → Client | Broadcasts an order's new status to that order's room |

## Key Technical Highlights

- **Geospatial matching**: MongoDB `$near` queries with a `2dsphere` index locate available drivers within a configurable radius.
- **Real-time, room-scoped updates**: Each order gets its own Socket.io room, so tracking data stays private to the customer and driver involved.
- **Secure auth flow**: Passwords are hashed with bcrypt before storage; JWT tokens carry user identity and role, verified by custom middleware on protected routes.
- **Input validation**: express-validator rejects malformed requests before they reach business logic, with consistent error responses.
- **Order state machine**: Orders move through a defined lifecycle (`requested → accepted → picked_up → in_transit → completed`), preventing invalid status jumps.

## Project Structure

```
delivery-tracker/
├── middleware/
│   ├── auth.js          # JWT verification middleware
│   └── errorHandler.js  # Centralized error handling
├── models/
│   ├── User.js
│   ├── Driver.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── driver.js
│   └── order.js
├── db.js                # MongoDB connection
├── index.js             # App entry point
└── .env                 # Environment variables (not committed)
```

## Future Improvements

- Redis caching for high-frequency driver location updates
- Push notifications
- Admin dashboard for monitoring active orders
- Automated test suite (Jest/Supertest)

---

Built by Shubhangi Verma as a portfolio project to learn real-time backend systems, geospatial querying, and WebSocket-based communication.
