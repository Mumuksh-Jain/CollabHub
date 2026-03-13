# CollabHub Backend Documentation

## Introduction for Beginners
Welcome to the CollabHub Backend! Think of the backend as the "brain" and "memory" of the application. While the frontend (what you see in the browser) creates the buttons and pages, the backend does the heavy lifting:
*   It securely saves user accounts and passwords.
*   It remembers who created which project.
*   It checks if someone is allowed to edit a project or join a team.

This project is built using:
*   **Node.js & Express:** The programming environment and framework we use to create a "server" that listens for requests from the frontend.
*   **MongoDB & Mongoose:** Our database where we permanently save data (like User info). Mongoose makes it easy to talk to MongoDB using JavaScript.
*   **JWT (JSON Web Tokens):** A secure way to give a user a "digital ID card" once they log in, proving who they are for future requests.

---

## Project Directory Structure

Here is how the files are organized, and what each folder is responsible for:

```text
backend/
├── server.js                        # The main starting point that launches the server.
├── package.json                     # Lists all the external code libraries we downloaded to help build this.
├── src/
│   ├── app.js                       # Configures all the global rules for the server.
│   ├── db/
│   │   └── db.js                    # The code connecting our server to the MongoDB database.
│   ├── models/
│   │   ├── user.model.js            # The blueprint for how a "User" is saved in the database.
│   │   └── project.model.js         # The blueprint for how a "Project" is saved.
│   ├── middleware/
│   │   ├── auth.middleware.js       # The security guard: checks if a user is logged in before letting them do something.
│   │   └── projectowner.middleware.js # The bouncer: checks if a user is the actual OWNER of a project.
│   ├── controllers/
│   │   ├── auth.controller.js       # The actual logic (the "how") for registering, logging in, etc.
│   │   └── project.controller.js    # The actual logic for creating, finding, or modifying projects.
│   └── routes/
│       ├── auth.route.js            # Defines the URLs (like /login) that trigger the Auth Controller.
│       └── project.routes.js        # Defines the URLs (like /create) that trigger the Project Controller.
```

---

## How It All Connects (The Request Flow)

If a user clicks "Create Project" on the frontend, here is the journey that data takes through our backend files:
1.  **[app.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/app.js)**: The request arrives at the server. [app.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/app.js) sees it starts with `/api/project` and hands it to [project.routes.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/routes/project.routes.js).
2.  **[project.routes.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/routes/project.routes.js)**: Sees the request is specifically for `/api/project/create`. It notices this route is protected by `authMiddleware`.
3.  **[auth.middleware.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/middleware/auth.middleware.js)**: Checks the user's digital ID card (their cookie) to prove they are logged in. If they aren't, it stops them here! If they are, it allows them to pass.
4.  **[project.controller.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/controllers/project.controller.js)**: The controller takes the data the user sent (title, description), bundles it up, and asks the database model to save it.
5.  **[project.model.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/models/project.model.js)**: Ensures the data matches our rules (e.g., "A project *must* have a title"), and then permanently saves it in MongoDB.

---

## Detailed File Breakdown

### 1. Application Setup & Database
*   **`server.js`**: The very first file to run. It uses the `dotenv` library to read hidden passwords (like our database password), calls `connectdb()`, and tells the server to start listening.
*   **[src/app.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/app.js)**: This defines *how* the server talks. It forces the server to accept data in JSON format (`express.json()`). Crucially, it sets up `cors` (Cross-Origin Resource Sharing) heavily restricted. It explicitly tells the browser: *"Yes, it is safe for the `localhost:5173` frontend to send me data and security cookies."*
*   **`src/db/db.js`**: A simple file holding the `connectdb` function. It dials out to our MongoDB address and establishes the connection.

### 2. Models (The Data Blueprints)
Mongoose uses "Schemas" to define exactly what a piece of data should look like.
*   **[user.model.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/models/user.model.js)**: Ensures every user has a `name`, `email`, a securely hashed `password`, an array of `skills`, a `bio`, and optionally a `github` link.
*   **[project.model.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/models/project.model.js)**: A complex blueprint. It requires text fields like `title` and `description`. It records who made it via the `created_by` field (which links directly to a specific User ID). It also holds lists for `join_requests`, current `members`, and a `removed_members` list to track historical removals for notifications.

### 3. Middleware (The Guards)
Middleware functions run *in the middle* of a request to check rules before the main code runs.
*   **[auth.middleware.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/middleware/auth.middleware.js)**: This intercepts requests that require a user to be logged in. It opens up `req.cookies`, grabs the JWT token, and decrypts it. Once decrypted, we know the ID of the user trying to make the request, and we attach it to `req.user` so the rest of the code knows who is asking!
*   **[projectowner.middleware.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/middleware/projectowner.middleware.js)**: Even if you are logged in, you shouldn't be able to delete someone else's project! This middleware takes the Project ID from the URL, finds the project, and verifies that the `created_by` field matches your specific `req.user.id`. If not, it throws an error.

### 4. Routes (The Map)
Routes act like a map directory, pointing specific URLs to the code that handles them.
*   **[auth.route.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/routes/auth.route.js)**:
    *   `POST /register`: Points to the new user creation logic.
    *   `POST /login`: Points to the login verify logic.
    *   `POST /logout`: Clears the user's secure cookie.
    *   `PUT /profile`: Updates user info.
*   **[project.routes.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/routes/project.routes.js)**:
    *   `GET /`: Fetches a list of all projects to show on the homepage.
    *   `POST /create`: (Guarded) Points to logic to make a new project.
    *   `PUT /update/:id` & `DELETE /delete/:id`: (Guarded by Owner) Modifies or removes projects.
    *   `POST /request`: (Guarded) A user clicks "Join" on the frontend; this route adds them to the project's pending `join_requests` list.
    *   `POST /:id/respond`: (Guarded by Owner) The owner approves/denies a pending user.
    *   `POST /remove-member/:projectId`: (Guarded by Owner) The owner can remove an existing member from the project. Removed members are tracked in a specific list so they can be notified.
    *   `GET /search`: Searches for projects by title, tech stack (array), or roles (array). Supports both standard queries and robust array-based filtering.

### 5. Controllers (The Brains)
The controllers contain the actual JavaScript logic to make the database do what the Routes asked for.
*   **[auth.controller.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/controllers/auth.controller.js)**: For registration, it uses the `bcrypt` library to encrypt the user's password before calling the `userModel` to save them. For logging in, it compares passwords, and if correct, generates a JWT token and assigns it to a strict `httpOnly` cookie (which prevents frontend JavaScript hackers from stealing it).
*   **[project.controller.js](file:///c:/Users/Administrator/OneDrive/Desktop/collabhub/backend/src/controllers/project.controller.js)**: Contains massive logical functions. For example, when fetching `getProjects`, it doesn't just return raw data; it uses Mongoose's `.populate()` feature. This tells the database: *"Instead of sending back the confusing ID string for `created_by`, go fetch that user's actual profile name and send that instead!"* 
    *   **Advanced Search Logic**: The `searchProject` controller is highly robust. It handles text searches (`q`) and filtered searches for multiple `tech_stack` and `roles_needed` items simultaneously. It uses the MongoDB `$in` operator to match any selected tags, ensuring flexible and powerful project discovery. It also handles both standard Axios array formats (`tech_stack[]`) and cleaner formats (`tech_stack`).
    *   **Member Management**: The `getMyProjects` controller specifically returns projects where the user is an owner, a current member, has a pending request, or has been **recently removed by the owner**. This ensures users are notified of their status changes.
