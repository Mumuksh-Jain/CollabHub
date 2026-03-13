# CollabHub Frontend Documentation

## Introduction for Beginners
Welcome to the CollabHub Frontend! Think of the frontend as the "face" and "hands" of the application. It's the visual part of the app that runs directly inside your web browser. 

The frontend's job is to:
*   Show you buttons, pages, and cool backgrounds.
*   Ask you for information (like your email when logging in).
*   Send that information to the "brain" (the backend server) and wait for a response.
*   React to the backend's response (e.g., changing the page from "Login" to "My Dashboard").

This project is built using:
*   **React:** A library that lets us build the app using reusable "Components" (like Lego blocks). For example, a `Navbar` is a component we build once and reuse on every page.
*   **Vite:** A super-fast tool that bundles all our React code together so the browser can read it.
*   **React Router:** The "GPS" of our app. It watches the URL (`/login`, `/profile`) and decides which React Component (Page) to show you.
*   **Context:** A "global backpack" where we store important data (like "Is the user logged in right now?") so any page can quickly check it without asking the backend every single time.

---

## Project Directory Structure

Here is how the files are organized, and what each folder is responsible for:

```text
frontend/
├── package.json                     # Lists all the external code libraries (like React) we downloaded.
├── index.html                       # The single, blank canvas page that the browser loads first.
├── vite.config.js                   # Settings for the Vite bundler tool.
├── src/
│   ├── main.jsx                     # The starting line. Grabs the blank index.html and injects React into it.
│   ├── App.jsx                      # The map. Wraps the whole app in the Router so it knows where to go.
│   ├── index.css                    # The global styling rules (colors, fonts, layout).
│   ├── context/
│   │   └── AuthContext.jsx          # The "backpack". Remembers if you are logged in.
│   ├── services/
│   │   └── api.js                   # The "messenger". Specifically configured to talk to our Backend securely.
│   ├── constants/
│   │   └── options.js               # Standardized lists of Tech Skills and Developer Roles.
│   ├── components/
│   │   ├── Navbar.jsx               # The top navigation bar seen on every page.
│   │   ├── Footer.jsx               # The bottom footer seen on every page.
│   │   ├── TagSelector.jsx          # A reusable multi-select dropdown for Skills and Roles.
│   │   ├── AdvancedFilter.jsx       # The advanced search interface for the Home page.
│   │   ├── CustomCursor.jsx         # Code to replace the standard mouse pointer with a cool dot/ring.
│   │   ├── ParticleBackground.jsx   # Draws the cool animated background behind everything using an HTML Canvas.
│   │   └── ProtectedRoute.jsx       # The "Security Guard" component. Kicks you out if you try to view a private page while logged out.
│   └── pages/
│       ├── Home.jsx                 # The landing page showing all public projects.
│       ├── Login.jsx                # The page where you type your email and password.
│       ├── Register.jsx             # The page to sign up for a new account.
│       ├── CreateProject.jsx        # The form to post a new project idea.
│       ├── MyProjects.jsx           # Your personal dashboard (shows projects you joined/own).
│       ├── Profile.jsx              # The page to edit your own skills and bio.
│       ├── UserProfile.jsx          # The public view of *someone else's* profile.
│       └── ProjectDetail.jsx        # The page showing extra details about a specific project.
```

---

## How It All Connects (The User Journey)

Here is a step-by-step example of what happens on the frontend when a user visits the site:

1.  **Loading (`index.html` -> `main.jsx` -> `App.jsx`)**: The user types `localhost:5173` into the browser. React wakes up, reads `App.jsx`, and sees you want the root URL `/`. 
2.  **The Backpack Check (`AuthContext.jsx`)**: Before showing the page, the `AuthContext` component quietly sends a "ping" to the backend (`/api/auth/profile`) asking, *"Does this browser have a valid login cookie?"* The backend says "No", so the Context updates itself saying *"We have a Guest."*
3.  **Rendering & Filtering (`Home.jsx`)**: Because you asked for `/`, React Router shows you the `Home.jsx` component. This component asks our messenger (`api.js`) to fetch projects. By default, it shows everything, but the user can use the **Advanced Filter** to narrow down results by multiple technologies and roles simultaneously.
4.  **Logging In (`Login.jsx`)**: You click the "Login" button. React Router changes the page to `Login.jsx`. You type in your email/password. 
5.  **Sending the Message (`api.js`)**: You click submit. The form uses `api.js` to securely send your email/password to the Backend. The Backend verifies it and sends back a successful response along with a secure, hidden HTTP-Cookie!
6.  **Updating the Backpack (`AuthContext.jsx`)**: The Login page tells the `AuthContext` the good news. The Context updates its state from *"Guest"* to *"User XYZ is Logged In."*
7.  **The Security Guard (`ProtectedRoute.jsx`)**: Now that you are logged in, you click "Create Project" (`/create-project`). React Router hands the request to `ProtectedRoute.jsx`. The guard checks the `AuthContext` backpack, sees you ARE logged in, and allows `CreateProject.jsx` to render! If you weren't logged in, the guard would instantly force you back to the `/login` page.

---

## Detailed File Concepts

### 1. Styling & Animations (`index.css` & `ParticleBackground.jsx`)
*   **`index.css`**: We did not use a massive library like Tailwind or Bootstrap. Instead, we wrote our own "Neo-Brutalist" design rules here. It relies on stark CSS variables (like `--bg: #f4f4f4` for the background) and custom CSS animations (like `@keyframes fadeUp`).
*   **`ParticleBackground.jsx`**: If you look behind the web app, there are animated waves or grids. This component manages an HTML `<canvas>`, running a hyper-fast loop 60 times a second to mathematically calculate and draw those shapes without slowing down the rest of the React application.

### 2. The Messenger (`services/api.js`)
*   Every time the frontend needs to talk to the backend, it uses this file. It is built using a tool called `axios`. 
*   **The Golden Rule:** It is configured with `withCredentials: true`. Without this one specific line of code, the browser would refuse to attach the secure "Login Cookie" when talking to the backend, meaning you would never stay logged in!

### 3. Page Components (`pages/`)
*   These are the "Lego Blocks" that make up actual distinct screens the user sees. 
*   Most pages (like `Home.jsx` or `ProjectDetail.jsx`) use a React Hook called `useEffect`. This hook basically means *"The moment this page appears on the screen, run this chunk of code."* We usually use it to trigger `api.js` to go fetch the specific data that page needs to display from the backend.

### 4. Standardized Selection (`TagSelector.jsx` & `options.js`)
*   To prevent users from typing skills with typos (e.g., "Reactjs" vs "React"), we implemented a predefined list of options in `options.js`.
*   The `TagSelector` component is used across the entire app (Register, Profile, Create Project) to ensure data is clean and consistent. This allows the backend to perform much more accurate searches and filtering.

### 5. Advanced Search (`AdvancedFilter.jsx`)
*   The `AdvancedFilter` component is a reusable, multi-select dropdown that allows users to filter projects by multiple technologies and roles simultaneously.
*   It is used in the `Home` page to provide an advanced search interface for users to find projects that match their interests.
*   The component uses the `TagSelector` component to display a list of available technologies and roles, and allows users to select multiple options.
*   The selected options are sent to the backend as an array of strings, which are then used to filter the projects.

### 6. Security Guard (`ProtectedRoute.jsx`)
*   The `ProtectedRoute` component is a security guard that ensures users are logged in before accessing private pages.
*   It is used in the `App` component to protect private pages from unauthorized access.
*   The component checks the `AuthContext` backpack to see if the user is logged in.
*   If the user is not logged in, the component redirects them to the `/login` page.
*   If the user is logged in, the component allows the user to access the private page.


