# 📋 TaskManager — Full-Stack Task Management App

A production-ready **Task Manager** application with **Role-Based Access Control (RBAC)**, built with a **Node.js/Express** backend, **MongoDB** database, and **React Native (Expo)** mobile frontend. Features JWT authentication, admin/user roles, and a modern dark-mode UI.

---

## 🛠 Tech Stack

| Layer      | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| **Backend**  | Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs       |
| **Mobile**   | React Native (Expo), React Navigation, Axios, AsyncStorage  |
| **Auth**     | JSON Web Tokens (JWT) with 7-day expiry                     |
| **Styling**  | Dark-mode-first design with custom color system              |
| **Validation** | express-validator (backend), custom validators (mobile)    |

---

## ✅ Features Implemented

### Must-Have Features
- ✅ User signup & login with JWT authentication
- ✅ Role-based access control (Admin vs User)
- ✅ Admin: Create, edit, delete, and assign tasks to any user
- ✅ User: View assigned tasks and update their status
- ✅ Task statuses: Pending, In Progress, Completed
- ✅ MongoDB with Mongoose models and validation
- ✅ Express API with structured error handling
- ✅ React Native mobile app with Expo
- ✅ Seed script with sample data

### Bonus Features
- ✅ JWT token persisted in AsyncStorage (survives app restart)
- ✅ Edit task inline on TaskDetailScreen (admin)
- ✅ Delete task with confirmation dialog (admin)
- ✅ Filter tasks by status (All / Pending / In Progress / Completed)
- ✅ Search tasks by title (client-side filter)
- ✅ Pull-to-refresh on TaskListScreen
- ✅ Role-based UI (FAB, edit/delete hidden for regular users)

### Design Features
- ✅ Dark slate backgrounds with indigo/emerald accents
- ✅ Animated task cards with fade-in and press feedback
- ✅ Pulsing FAB button for admin users
- ✅ Animated loading spinner
- ✅ Color-coded status badges (pill-shaped)
- ✅ Empty state illustrations with icons
- ✅ Keyboard-aware form views
- ✅ Proper error banners and success alerts

---

## 📁 Project Structure

```
taskmanager/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Signup & Login logic
│   │   ├── taskController.js      # CRUD operations for tasks
│   │   └── userController.js      # Get all users (admin)
│   ├── middleware/
│   │   ├── auth.js                # JWT verification middleware
│   │   └── role.js                # Role-based authorization
│   ├── models/
│   │   ├── User.js                # User schema (name, email, password, role)
│   │   └── Task.js                # Task schema (title, desc, status, refs)
│   ├── routes/
│   │   ├── auth.js                # Auth routes (/api/auth/*)
│   │   ├── tasks.js               # Task routes (/api/tasks/*)
│   │   └── users.js               # User routes (/api/users)
│   ├── seeds/
│   │   └── seed.js                # Database seeder script
│   ├── .env                       # Environment variables
│   ├── .env.example               # Env template
│   ├── package.json
│   └── server.js                  # Express entry point
│
├── mobile/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js           # Axios instance + interceptors
│   │   │   ├── auth.js            # Auth API calls
│   │   │   └── tasks.js           # Task & User API calls
│   │   ├── context/
│   │   │   └── AuthContext.js     # Auth state management
│   │   ├── screens/
│   │   │   ├── LoginScreen.js     # Login form
│   │   │   ├── SignupScreen.js    # Registration form
│   │   │   ├── TaskListScreen.js  # Main task list with search/filter
│   │   │   ├── TaskDetailScreen.js# Task details + edit/delete
│   │   │   └── CreateTaskScreen.js# Create new task (admin)
│   │   ├── components/
│   │   │   ├── TaskCard.js        # Animated task card
│   │   │   ├── StatusBadge.js     # Color-coded status pill
│   │   │   ├── LoadingSpinner.js  # Animated loading indicator
│   │   │   └── EmptyState.js      # Empty list illustration
│   │   ├── navigation/
│   │   │   └── AppNavigator.js    # Auth/Main stack navigation
│   │   └── utils/
│   │       ├── colors.js          # Theme color constants
│   │       └── helpers.js         # Formatting utilities
│   ├── App.js                     # Expo entry point
│   ├── app.json                   # Expo configuration
│   ├── babel.config.js            # Babel + Reanimated plugin
│   └── package.json
│
└── README.md                      # This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+ installed
- MongoDB running locally (or a MongoDB Atlas URI)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator / Expo Go on physical device

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and a JWT secret

# 4. Seed the database with sample data
node seeds/seed.js

# 5. Start the development server
npm run dev
# Server starts on http://localhost:5000
```

### Mobile Setup

```bash
# 1. Navigate to mobile
cd mobile

# 2. Install dependencies
npm install

# 3. ⚠️ Update the API base URL
# Open src/api/axios.js and change BASE_URL to your machine's local IP:
# Example: const BASE_URL = 'http://192.168.1.100:5000/api';
# For Android emulator: http://10.0.2.2:5000/api
# For iOS simulator: http://localhost:5000/api

# 4. Start Expo
npx expo start
```

> **💡 Tip:** To find your local IP, run `ifconfig | grep "inet "` (macOS) or `ipconfig` (Windows).

---

## 🔑 Test Credentials

These accounts are created by the seed script:

| Role  | Email               | Password   |
| ----- | ------------------- | ---------- |
| Admin | admin@taskapp.com   | Admin@123  |
| User  | user1@taskapp.com   | User@123   |
| User  | user2@taskapp.com   | User@123   |

---

## 📡 API Endpoints

### Authentication
| Method | Route              | Auth | Description                          |
| ------ | ------------------ | ---- | ------------------------------------ |
| POST   | `/api/auth/signup`  | ❌   | Register new user                    |
| POST   | `/api/auth/login`   | ❌   | Login and receive JWT                |

### Tasks
| Method | Route                     | Auth | Description                              |
| ------ | ------------------------- | ---- | ---------------------------------------- |
| GET    | `/api/tasks`              | ✅   | Get tasks (admin: all, user: assigned)   |
| GET    | `/api/tasks/my`           | ✅   | Get tasks assigned to current user       |
| POST   | `/api/tasks`              | ✅🛡️ | Create a task (admin only)              |
| PATCH  | `/api/tasks/:id/status`   | ✅   | Update task status                       |
| PUT    | `/api/tasks/:id`          | ✅🛡️ | Update full task (admin only)           |
| DELETE | `/api/tasks/:id`          | ✅🛡️ | Delete task (admin only)                |

### Users
| Method | Route         | Auth | Description                              |
| ------ | ------------- | ---- | ---------------------------------------- |
| GET    | `/api/users`  | ✅🛡️ | Get all users (admin — for assignment)  |

> ✅ = Requires JWT token | 🛡️ = Admin role required

---

## 🔐 Role-Based Access Control

| Action                    | Admin | User |
| ------------------------- | ----- | ---- |
| Signup / Login            | ✅     | ✅   |
| View ALL tasks            | ✅     | ❌   |
| View assigned tasks       | ✅     | ✅   |
| Create tasks              | ✅     | ❌   |
| Assign tasks to users     | ✅     | ❌   |
| Edit task title/desc      | ✅     | ❌   |
| Update task status (own)  | ✅     | ✅   |
| Update task status (any)  | ✅     | ❌   |
| Delete tasks              | ✅     | ❌   |
| See Create FAB button     | ✅     | ❌   |
| See Edit/Delete buttons   | ✅     | ❌   |

---

## 📱 App Screens

1. **Login Screen** — Email/password form with validation and error display
2. **Signup Screen** — Registration with role selection (User/Admin)
3. **Task List Screen** — Searchable, filterable task list with pull-to-refresh
4. **Task Detail Screen** — Full task info with status change, inline edit, and delete
5. **Create Task Screen** — Admin-only form with user assignment picker

---

## 🎨 Design System

- **Background:** Dark navy (`#0F172A`) and slate (`#1E293B`)
- **Accent:** Indigo (`#6366F1`) and Emerald (`#10B981`)
- **Cards:** 12px border-radius, subtle 1px borders, shadow elevation
- **Status Badges:** Pill-shaped with soft tinted backgrounds
  - Pending → Orange
  - In Progress → Blue
  - Completed → Green
- **Animations:** Card fade-in, FAB pulse, press scale feedback

---

## ⚠️ Important Notes

1. **MongoDB must be running** before starting the backend. Use a local instance or MongoDB Atlas.
2. **Update `BASE_URL`** in `mobile/src/api/axios.js` to match your backend server's IP address.
3. **Run the seed script** (`node seeds/seed.js`) to populate initial data before testing.
4. The JWT token **expires after 7 days**. The app will auto-clear expired tokens.
5. CORS is open by default. For production, restrict origins in `server.js`.

---

## 📄 License

This project is built for educational/assessment purposes.
# Task-Manager-mobile-app
