# 🔐 Node.js Authentication API

A secure and scalable authentication system built with **Node.js**, **Express**, and **MongoDB**. It includes features such as user registration, login, logout, email verification, and password reset using tokens and secure practices like password hashing and JWT.

---

## 📦 Features

- ✅ User Registration with hashed password
- 🔐 User Login with JWT authentication
- 📧 Email Verification (via Nodemailer)
- 🔁 Forgot Password & Reset Password with expiry token
- 👤 Get Logged-in User Profile (`getMe`)
- 🚪 Logout functionality (clears cookie/token)
- 🧪 Middleware for route protection (`isLoggedIn`)

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Email Service**: Nodemailer (Mailtrap for testing)
- **Environment Config**: dotenv

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rahat100x/Authentication.git
cd Authentication
````

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

Create a `.env` file in the root directory and add the following:

```env
FRONTEND_URL=http://localhost:3000
PORT=3000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.y3cdzdp.mongodb.net/authentication
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=5f**********2c
MAILTRAP_PASSWORD=dd**********128
BASE_URL=http://localhost:3000
JWT_SECRET=s*******
```

### 4. Start the server

```bash
npm run dev
```

Server runs at: [http://localhost:3000]

---

## 📬 Email Testing (Mailtrap)

Uses [Mailtrap Email](https://mailtrap.io) for development email testing. You can view emails in the console output or login to the Mailtrap thereal inbox.

---

## 🧪 API Endpoints

| Method | Route                                 | Description                 |
| ------ | ------------------------------------- | --------------------------- |
| POST   | `/api/v1/users/register`              | Register a new user         |
| POST   | `/api/v1/users/login`                 | Login user and return token |
| GET    | `/api/v1/users/me`                    | Get current logged-in user  |
| GET    | `/api/v1/users/verify/:token`         | Verify user email           |
| POST   | `/api/v1/users/forget-password`       | Send reset password email   |
| POST   | `/api/v1/users/reset-password/:token` | Reset password via token    |
| GET    | `/api/v1/users/logout`                | Logout the user             |

---

## 📁 Folder Structure

```
.
├── controllers/
│   └── user.controller.js
├── middleware/
│   └── auth.js
├── models/
│   └── User.models.js
├── routes/
│   └── user.routes.js
├── .env
├── .gitignore
├── server.js / index.js
└── README.md
```

---

## ⚙️ Environment Setup Tips

* Use tools like **Postman** to test endpoints.
* Store `token` in **HTTP-only cookies** or **Authorization headers**.
* In production, configure `secure` cookies and real SMTP credentials.

---