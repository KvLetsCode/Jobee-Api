📌 Jobbee API

A RESTful API built with Node.js, Express, and MongoDB for managing job postings and applications.
This project provides authentication, job listings, user profiles, and application management features.

🚀 Features

🔐 User authentication (JWT & cookies)

👤 Role-based access (Admin / User)

📄 Job CRUD operations (Create, Read, Update, Delete)

📑 Application handling (apply, withdraw, list)

🔍 Search & filter jobs by keyword, location, and category

📊 Aggregation pipelines for job stats

☁️ File upload support (CV/resume)

🛡️ Security (helmet, rate limiting, sanitization)

🛠️ Tech Stack

Backend: Node.js, Express.js

Database: MongoDB + Mongoose

Authentication: JWT + Cookies

Security: Helmet, Rate limiter, Data sanitization

Documentation: Swagger / Docgen

Deployment: (Heroku / Vercel / Render / AWS — adjust if needed)

📂 Project Structure
Jobbee-API/
│-- config/          # DB & environment config
│-- controllers/     # Route controllers
│-- middleware/      # Auth & error handling
│-- models/          # Mongoose schemas
│-- routes/          # Express routes
│-- utils/           # Helpers (email, token, etc.)
│-- app.js           # Express app entry
│-- server.js        # Server start script
│-- package.json

⚡ Getting Started
1️⃣ Clone the repository
git clone https://github.com/your-username/jobbee-api.git
cd jobbee-api

2️⃣ Install dependencies
npm install

3️⃣ Set up environment variables

Create a .env file in the root directory:

PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass

4️⃣ Run the server
# Development
npm run dev

# Production
npm start


Server will start at 👉 http://localhost:5000

📖 API Documentation
Option 1: Swagger (Interactive Docs)

After starting the server, visit:

http://localhost:5000/api-docs

Option 2: Docgen (from Postman collection)

Export Postman collection → Run:

docgen build -i Jobbee.postman_collection.json -o docs.html

✅ Available Endpoints (Sample)
Auth

POST /api/v1/auth/register → Register a new user

POST /api/v1/auth/login → Login user

GET /api/v1/auth/me → Get current logged-in user

Jobs

GET /api/v1/jobs → List all jobs

POST /api/v1/jobs → Create new job (Admin only)

GET /api/v1/jobs/:id → Get job by ID

PUT /api/v1/jobs/:id → Update job (Admin only)

DELETE /api/v1/jobs/:id → Delete job (Admin only)

Applications

POST /api/v1/jobs/:id/apply → Apply for a job

GET /api/v1/jobs/:id/applicants → View job applicants (Admin)

🧪 Testing
npm run test

🔐 Security Practices

Passwords hashed with bcrypt

JWT authentication with HttpOnly cookies

Data validation & sanitization

Rate limiting against brute force attacks

🤝 Contributing

Fork this repo

Create a feature branch (git checkout -b feature-name)

Commit changes (git commit -m "Add feature")

Push branch (git push origin feature-name)

Create a pull request

📜 License

This project is licensed under the MIT License.
