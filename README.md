# 🤝 CollabHub

![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb) ![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens) ![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203-F55036?style=flat) ![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?style=flat&logo=cloudinary)

CollabHub is a full-stack developer collaboration platform powered by **AI-driven teammate matching and profile enhancement**. Instead of manually browsing profiles and guessing compatibility, it uses **Groq's Llama 3** to analyze project requirements against developer skill sets — ranking candidates by fit percentage, structuring raw project ideas, and auto-generating professional bios in seconds.

The platform allows users to:
- Create and manage projects with detailed tech stacks and required roles
- Send and manage team join requests
- Run AI-powered teammate matching to find the best candidates for a project
- Enhance profiles and project ideas using LLM-generated suggestions
- Upload images via Cloudinary for projects and profiles
- Authenticate securely via JWT cookie-based sessions

---

## 📌 Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Application Workflow](#application-workflow)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [Author](#author)

---

## 📖 Overview

Finding the right collaborators for a side project is hard. Posting in forums rarely works, and manually scanning profiles is tedious. CollabHub solves this with AI-first collaboration:

- A user creates a project with a description, required skills, and open roles
- The **Match Teammates** tool sends the project's needs and all user profiles to Groq's Llama 3
- Candidates are ranked by match percentage with visual progress bar indicators
- The **Improve Idea** tool turns a rough project concept into a polished title, description, and skill list
- The **Enhance Profile** tool removes the blank-page problem — generating a professional bio from a developer's existing skills and experience

---

## 📸 Screenshots

### Home
![Home](frontend/public/src/assets/screenshots/Home.png)

### Login
![Login](frontend/public/src/assets/screenshots/login.png)

### AI Project Enhancer
![AI Project Enhancer](frontend/public/src/assets/screenshots/AI%20Project%20Enhancer.png)

### AI Team Recommendation
![AI Team Recommendation](frontend/public/src/assets/screenshots/AI%20Team%20Recommendation.png)

---

## ✨ Core Features

### 👤 User System
- Registration and login with secure JWT authentication
- HTTP-only cookie sessions
- Personal profile with skills, bio, and GitHub link
- Profile and project image uploads via Cloudinary
- Dashboard showing owned and joined projects
- Protected routes — unauthenticated users redirected to login

### 🤖 AI Integrations
- **Match Teammates** — sends a project's requirements and all registered user profiles to Groq's Llama 3, returning candidates ranked by compatibility with match percentages and visual progress bars
- **Improve Idea** — converts raw user input into a structured project title, description, and list of required skills/roles
- **Enhance Profile** — auto-generates a clean, professional developer biography from a user's existing skills and experience

### 📁 Project Management
- Create and edit projects with tech stack and role information
- Search projects by title, technology, or open roles
- Send join requests to any project
- Approve or reject incoming join requests as the project owner
- Invite specific users directly to your project
- Remove members from your own projects

### 🔐 Security
- JWT authentication with `jsonwebtoken`
- Bcrypt password hashing
- HTTP-only cookies — token never accessible via JavaScript
- Owner-based permissions enforced at the middleware level
- `.env` secrets never committed to version control

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React + Vite | UI framework and fast build tool |
| React Router | Client-side routing |
| Axios | HTTP requests with cookie support |
| Context API | Global auth state management |
| Custom CSS | Neo-Brutalist design system |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| Mongoose | MongoDB schema and queries |
| JWT | Token-based authentication |
| Bcrypt | Password hashing |

### AI & Media Services
| Technology | Purpose |
|-----------|---------|
| Groq API (Llama 3) | LLM powering all three AI features |
| Cloudinary | Cloud image storage and delivery |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Cloud-hosted database |
| Vite | Dev server and production bundler |

---

## 🧠 Architecture

CollabHub follows a two-service architecture where the React frontend communicates with the Node backend, which handles data logic, AI calls, and media uploads:

```
Browser
   │
   │  HTTP (port 5173 dev / 3000 prod)
   ▼
React Frontend
   │
   │  HTTP (port 3000)
   ▼
Node/Express Backend ──────────────────► MongoDB Atlas (cloud)
   │                 \
   │  HTTPS (external) └────────────► Cloudinary (image storage)
   ▼
Groq API — Llama 3 (AI features)
```

**Key architectural decisions:**

- All AI calls are made **server-side only** — the Groq API key is never exposed to the browser.
- All image uploads are proxied through the backend to Cloudinary — the frontend never holds upload credentials.
- MongoDB is hosted on **Atlas** — no local database setup required.
- Auth state is managed in React via **Context API**, hydrated from a protected `/api/auth/me` endpoint on page load.
- Owner-based permissions are enforced by a dedicated **`projectowner.middleware.js`** — not just in controller logic.

---

## 📂 Project Structure

```text
CollabHub/
├── README.md
│
├── backend/
│   ├── server.js                        # Entry point
│   ├── package.json
│   └── src/
│       ├── app.js                       # Express setup, middleware, routes
│       ├── db/db.js                     # MongoDB Atlas connection
│       ├── models/
│       │   ├── user.model.js
│       │   └── project.model.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── project.controller.js
│       ├── routes/
│       │   ├── auth.route.js
│       │   └── project.routes.js
│       └── middleware/
│           ├── auth.middleware.js
│           └── projectowner.middleware.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/AuthContext.jsx
        ├── services/api.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── CustomCursor.jsx
        │   ├── ParticleBackground.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── CreateProject.jsx
            ├── MyProjects.jsx
            ├── Profile.jsx
            ├── UserProfile.jsx
            └── ProjectDetail.jsx
```

---

## 🔌 API Endpoints

### Authentication
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create new account |
| POST | `/api/auth/login` | No | Login, receive JWT cookie |
| POST | `/api/auth/logout` | Yes | Clear auth cookie |
| PUT | `/api/auth/update-profile` | Yes | Update bio, skills, GitHub |
| GET | `/api/auth/user/:id` | Yes | Get a user's public profile |

### Projects
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/project` | Yes | Get all projects |
| GET | `/api/project/search` | Yes | Search by title, stack, or role |
| POST | `/api/project/create` | Yes | Create a new project |
| PUT | `/api/project/update/:id` | Yes (owner) | Update project details |
| DELETE | `/api/project/delete/:id` | Yes (owner) | Delete a project |
| POST | `/api/project/request` | Yes | Send a join request |
| POST | `/api/project/:id/respond` | Yes (owner) | Approve or reject a request |
| POST | `/api/project/invite/:id` | Yes (owner) | Invite a user to the project |
| POST | `/api/project/respond-invite/:id` | Yes | Accept or decline an invite |
| POST | `/api/project/remove-member/:projectId` | Yes (owner) | Remove a team member |

### AI Tools
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/ai/match` | Yes | Rank users against project needs |
| POST | `/api/ai/improve-idea` | Yes | Structure a raw project idea |
| POST | `/api/ai/enhance-profile` | Yes | Generate a professional bio |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Groq API key
- Cloudinary account

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/collabhub.git
cd collabhub
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables) below), then:

```bash
npm start
```

Backend runs on: `http://localhost:3000`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔑 Environment Variables

Create `backend/.env`:

```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/CollabHub
JWT_SECRET=your_secret_key_here
GROQ_API_KEY=your_groq_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the Express server listens on |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `GROQ_API_KEY` | API key for Groq AI features (Llama 3) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

> **Never commit `.env` to Git.**

---

## 🔄 Application Workflow

### AI Match Teammates — step by step

1. Project owner opens a project and clicks **Match Teammates**
2. React sends `POST /api/ai/match` with the project ID
3. `auth.middleware` verifies JWT cookie → attaches `req.user`
4. Controller fetches the project details and all registered users from MongoDB Atlas
5. Backend sends project requirements + user profiles to **Groq API (Llama 3)**
6. Llama 3 ranks each user by skill alignment and returns match percentages
7. Results are sorted by score descending
8. Ranked candidates with progress bars returned → React displays results

---

## 🚧 Future Improvements

- [ ] Real-time collaboration using WebSockets
- [ ] In-app notifications for join requests and approvals
- [ ] Project commenting and discussion threads
- [ ] Team chat feature per project
- [ ] AI-powered project recommendations for users
- [ ] Mobile app (React Native)
- [ ] OAuth login (GitHub, Google)

---

## 🤝 Contributing

```bash
# Fork the repository
git checkout -b feature-name
git commit -m "Add new feature"
git push origin feature-name
# Open a Pull Request
```

---

## 👨‍💻 Author

Developed as a full-stack developer collaboration platform.

Developed by **Mumuksh Jain**

- GitHub: [@Mumuksh-Jain](https://github.com/Mumuksh-Jain)


---

⭐ If you found this project useful, consider giving it a star!