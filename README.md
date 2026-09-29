# Loan Application Tracker

Beginner-friendly MERN stack project where users can apply for loans and an admin can approve or reject applications.

## Folder structure

```text
loan-application-tracker/
├── backend/
│   ├── controllers/loanController.js
│   ├── models/Loan.js
│   ├── routes/loanRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/loans.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── styles.css
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

## Prerequisites

- Node.js 18 or newer
- MongoDB local server, or a MongoDB Atlas connection string

## Backend setup

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Open `backend/.env` and set `MONGO_URI`, `JWT_SECRET`, and `ADMIN_EMAIL`. For email notifications, also configure the `SMTP_*` values from `backend/.env.example`. For local MongoDB, the example value works if MongoDB is running. Registering with `ADMIN_EMAIL` creates the admin account; all other registrations create normal user accounts.

Start the API:

```powershell
npm run dev
```

The API runs at `http://localhost:5000`.

## Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173`.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/loans` | All applications |
| POST | `/api/loans` | Create an application |
| DELETE | `/api/loans/:id` | Delete an application |
| PATCH | `/api/loans/:id/status` | Approve, reject, or reset status |
| POST | `/api/auth/register` | Create a user or admin account |
| POST | `/api/auth/login` | Login and receive a JWT |
| GET | `/api/banks` | Get Indian bank names; supports `?search=hdfc` |
| GET | `/api/users` | Admin: list users |
| PATCH | `/api/users/:id` | Admin: update user name, email, or role |
| DELETE | `/api/users/:id` | Admin: delete a user and their applications |
| POST | `/api/loans/:id/email` | Admin: email the loan applicant via SMTP |

## User and admin flow

1. Applicant view me user apna naam, amount, tenure aur purpose bhar kar application submit karta hai.
2. Har new application ka status `Pending` hota hai.
3. Admin dashboard me pending applications ke liye `Approve` aur `Reject` buttons hote hain.
4. Applicant list me latest status (`Pending`, `Approved`, ya `Rejected`) dikhai deta hai.

Loan routes now require a JWT. Normal users see only their applicant workspace and own applications. Admins land directly on the admin workspace, where they can review applications, update or delete users, and email applicants when SMTP is configured. The bank endpoint is a maintained local list; a credit-bureau API is still required to retrieve a person's complete loan history.

## GitHub par upload

1. `.env` files ko commit na karein; `.env.example` already included hai.
2. Project root par `git init` run karein.
3. `git add .`, `git commit -m "Build loan application tracker"` run karein.
4. GitHub par empty repository banakar `git remote add origin <repository-url>` aur `git push -u origin main` run karein.
