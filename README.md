# TaskFlow - Mobile Task Manager

A premium, role-based mobile task management application built with Expo (React Native), Node.js, and Clerk Authentication.

## 🚀 Key Features

### 1. Robust Authentication & Role Sync
- **Clerk Integration**: Secure social and email login powered by Clerk.
- **Dynamic Role Management**: Automatic synchronization between Clerk organization roles and the local MongoDB database.
- **Auto-Promotion**: Users with the `org:admin` role in Clerk are automatically promoted to Admin in the backend for seamless management.

### 2. Role-Based Access Control (RBAC)
- **Admin Privileges**:
  - Full visibility: View every task created within the organization.
  - Task Creation: Exclusively authorized to create new tasks and assign them to team members.
  - Management: Oversee team activity and workspace settings.
- **Team Member Experience**:
  - Focused View: Targeted task list showing only tasks assigned to the specific user.
  - Status Updates: Ability to update task progress (Pending -> In Progress -> Completed).
  - Security: Prevented from accessing administrative creation tools.

### 3. Premium UI/UX Design
- **Glassmorphism**: Modern, frosted-glass interface elements with subtle glows and gradients.
- **Dark Mode Support**: Context-aware theme system with sleek dark and light modes.
- **Micro-Animations**: Animated Floating Action Buttons (FAB) and smooth state transitions.
- **Responsive Layout**: Optimized for various Android and iOS screen sizes.

---

## 🛠️ Setup Instructions

### Backend Setup (Node.js & MongoDB)

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```
4. **Run the server**:
   ```bash
   npm run dev
   ```

### Mobile Setup (Expo)

1. **Navigate to the mobile folder**:
   ```bash
   cd mobile
   ```
2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `mobile` directory:
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   EXPO_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   ```
4. **Start the development server**:
   ```bash
   npx expo start -c
   ```

---

## 📦 Deployment & Builds

### Vercel Deployment (Backend)
- Ensure the `MONGO_URI` and `CLERK_SECRET_KEY` are added to your Vercel project settings.
- Trigger a redeploy after any backend code changes to sync new role logic.

### Android APK Build (EAS Local)
To build an APK without using cloud credits:
1. Ensure Java (JDK 17+) and Android Studio are installed.
2. Run:
   ```bash
   JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" eas build --platform android --profile preview --local
   ```

---

## 🔧 Technical Troubleshooting

### 1. "Forbidden" Error on Task Creation
If an Admin sees a "Forbidden" error, they must **Log Out** and **Log In** again. This triggers the "Force Sync" logic which promotes their local account to Admin status based on their Clerk role.

### 2. "AAPT2" or Asset Compilation Failures
All assets (like `app_icon.png`) must be solid, non-transparent PNGs to satisfy Android's native compilation requirements.
