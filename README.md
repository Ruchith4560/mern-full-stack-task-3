# Task 3 – JWT Authentication (Full-Stack)

> MERN Stack Internship | Alfido Tech

Adds **signup/login with bcrypt + JWT** to the Task 1 API and Task 2 React app.

---

## 📁 Project Structure

```
task3-auth/
├── server/                         # Express + MongoDB backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # MongoDB connection
│   │   │   └── jwt.js              # sign/verify helpers + cookie options
│   │   ├── models/
│   │   │   ├── User.js             # bcrypt pre-save hook, comparePassword method
│   │   │   └── Product.js          # now stores createdBy (User ref)
│   │   ├── controllers/
│   │   │   ├── authController.js   # signup, login, logout, getMe
│   │   │   └── productController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # protect + restrictTo
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # /api/auth/*
│   │   │   └── productRoutes.js    # /api/products/* (all protected)
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── client/                         # React frontend
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js      # global auth state via React Context
    │   ├── components/
    │   │   ├── Navbar/             # auth-aware nav (shows user + logout)
    │   │   ├── ProtectedRoute/     # redirect to /login if not authenticated
    │   │   ├── ProductCard/        # hides delete button for non-admins
    │   │   └── ProductForm/
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx   # protected
    │   │   ├── CreateProductPage.jsx
    │   │   ├── EditProductPage.jsx
    │   │   └── ProductDetailPage.jsx
    │   ├── services/api.js         # withCredentials: true for cookie auth
    │   ├── App.jsx                 # routes wrapped in AuthProvider
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Getting Started

### 1. Server setup
```bash
cd server
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm run dev
```

### 2. Client setup
```bash
cd client
npm install
cp .env.example .env
npm start
```

---

## 📡 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user, returns JWT cookie |
| POST | `/api/auth/login` | Login, returns JWT cookie |
| POST | `/api/auth/logout` | Clears JWT cookie |
| GET | `/api/auth/me` | 🔒 Returns current user (requires JWT) |

### Products (All Protected)
| Method | Endpoint | Who |
|--------|----------|-----|
| GET | `/api/products` | Any logged-in user |
| GET | `/api/products/:id` | Any logged-in user |
| POST | `/api/products` | Any logged-in user |
| PUT/PATCH | `/api/products/:id` | Any logged-in user |
| DELETE | `/api/products/:id` | 🔴 Admin only |

---

## 🧠 How Auth Works (Flow)

```
1. User submits login form
        ↓
2. Server validates credentials (bcrypt.compare)
        ↓
3. Server signs a JWT with user's _id
        ↓
4. JWT sent as httpOnly cookie (browser stores it automatically)
        ↓
5. Every subsequent request — browser sends cookie automatically
        ↓
6. protect middleware reads cookie → verifies JWT → attaches req.user
        ↓
7. Controller runs with req.user available
```

---

## 🔐 Security Notes

### Where to Store Tokens

| Method | XSS Safe | CSRF Safe | Recommended |
|--------|----------|-----------|-------------|
| **httpOnly Cookie** | ✅ Yes | ⚠️ Add CSRF token | ✅ **Best choice** |
| localStorage | ❌ No | ✅ Yes | ❌ Avoid |
| sessionStorage | ❌ No | ✅ Yes | ❌ Avoid |
| In-memory (JS var) | ✅ Yes | ✅ Yes | ⚠️ Lost on refresh |

**This project uses httpOnly cookies** — JavaScript cannot access them, which prevents XSS attacks from stealing tokens.

### Common Pitfalls to Avoid

**1. Storing JWT in localStorage**
```js
// ❌ BAD — any XSS script can steal this
localStorage.setItem('token', jwt);

// ✅ GOOD — httpOnly cookie, JS cannot read it
res.cookie('token', jwt, { httpOnly: true, secure: true });
```

**2. Weak JWT secret**
```bash
# ❌ BAD
JWT_SECRET=secret123

# ✅ GOOD — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

**3. Not expiring tokens**
```js
// ❌ BAD — token valid forever
jwt.sign({ id }, secret);

// ✅ GOOD — short expiry + refresh token pattern in production
jwt.sign({ id }, secret, { expiresIn: '7d' });
```

**4. Sending same error for "user not found" vs "wrong password"**
```js
// ❌ BAD — reveals which emails are registered (user enumeration)
if (!user) return res.status(404).json({ message: 'User not found' });
if (!match) return res.status(401).json({ message: 'Wrong password' });

// ✅ GOOD — same generic message for both cases
if (!user || !await user.comparePassword(password)) {
  return res.status(401).json({ message: 'Invalid email or password' });
}
```

**5. Not running validators on updates**
```js
// ❌ BAD — schema rules bypassed
Model.findByIdAndUpdate(id, data);

// ✅ GOOD
Model.findByIdAndUpdate(id, data, { runValidators: true });
```

**6. Exposing password hash in API responses**
```js
// ❌ BAD — password field returned in JSON
const user = await User.findById(id);

// ✅ GOOD — schema has select: false, or explicitly exclude
const user = await User.findById(id).select('-password');
```

---

## 🛡️ Role-Based Access Control

```js
// server — restrict DELETE to admins only
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

// client — hide delete button for non-admins
{isAdmin && <button onClick={handleDelete}>Delete</button>}
```

To promote a user to admin, update their role in MongoDB:
```js
// MongoDB shell
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

---

## 🔗 Related Repos
- **Task 1 – CRUD API**: [github.com/Ruchith4560/task1-crud-api](https://github.com/Ruchith4560/task1-crud-api)
- **Task 2 – React SPA**: [github.com/YOUR_USERNAME/task2-react-frontend](https://github.com/Ruchith4560/task2-react-frontend)
