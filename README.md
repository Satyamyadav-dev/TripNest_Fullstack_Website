# TripNest_Fullstack_Website
## 🚀 Live Demo -> https://tripnest-u0jx.onrender.com
🌍 A modern travel booking web application built using Node.js, Express, EJS, and MongoDB. TripNest helps users discover comfortable stays, explore city destinations, and plan trips with ease.


A full-stack Node.js/Express application for creating and browsing travel listings. Built with the MVC pattern, Tripnest supports user authentication, CRUD listings with images (Cloudinary), reviews, maps (Leaflet/Mapbox), and robust server-side validation.

⚡ Overview

Tech Stack: Node.js · Express · MongoDB (Mongoose) · EJS · Passport · Cloudinary · Mapbox

Key Features:

• User signup/login with sessions  
• CRUD listings with image uploads and geolocation  
• Review system  
• Owner-based edit/delete 
• Flash messages & error handling
• Server-side validation  

💻 Project Structure (MVC)

• Model: /models/ — Mongoose schemas for listings, reviews, users 
• View: /views/ — EJS templates & layouts  
• Controller: /controllers/ — route logic for listings, reviews, users  

Other folders:

• /routes/ — Express routers
• /middleware/ — authentication & authorization  
• /utils/ — helpers (validation, Cloudinary config, custom errors) 
• /public/ — static assets
• /init/ — seeding or setup scripts  

app.js — main entry point and Express setup

🚀 Getting Started (Local) Prerequisites

• Node.js (v16+)  
• npm 
• MongoDB (local or Atlas) — Optional: Cloudinary & MapTiler accounts  

### Environment Setup

Create a `.env` file in the root directory:

```
MONGO_URI=mongodb://localhost:27017/tripnest
PORT=3000
SECRET=your-session-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_KEY=your-cloud-key
CLOUDINARY_SECRET=your-cloud-secret
MAPBOX_API_KEY=your-mapbox-api-key
```

🗺️ Routes Summary

Below is a concise overview of the primary routes in the application. The Auth column shows whether the user must be logged in, while the Owner column indicates routes restricted to the listing owner.

### Listings

| Method | Path               | Description                   | Auth  |
|--------|---------------------|-------------------------------|--------|
| GET    | /listings           | View all listings             | No     |
| GET    | /listings/new       | Form to create a new listing | Yes    |
| POST   | /listings           | Create a new listing         | Yes    |
| GET    | /listings/:id       | Show a single listing        | No     |
| GET    | /listings/:id/edit  | Form to edit a listing       | Owner  |
| PUT    | /listings/:id       | Update a listing             | Owner  |
| DELETE | /listings/:id       | Delete a listing             | Owner  |


Reviews

| Method | Path                                   | Description               | Auth           |
|--------|-----------------------------------------|---------------------------|----------------|
| POST   | /listings/:id/reviews                   | Add a review to a listing | Yes            |
| DELETE | /listings/:id/reviews/:reviewId         | Delete a review           |                |


Users

| Method | Path      | Description              | Auth |
|--------|-----------|---------------------------|------|
| GET    | /register | Show registration form    | No   |
| POST   | /register | Register a new user       | No   |
| GET    | /login    | Show login form           | No   |
| POST   | /login    | Log in                    | No   |
| GET    | /logout   | Log out current user      | Yes  |

For exact implementations and middleware checks see the `routes/` and `controllers/` folders.


🧰 Troubleshooting


| Issue                   | Fix                                                                                     |
|-------------------------|------------------------------------------------------------------------------------------|
| MongoNetworkError       | Check `MONGO_URI` and MongoDB service                                                   |
| Cloudinary upload fails | Verify `CLOUDINARY_*` credentials                                                        |
| Map not showing         | Ensure `MAPTILER_KEY` (if using MapTiler) or Leaflet tile provider setup; check `public/js/map.js` |
| Sessions not persisting | Confirm `SECRET` and session store config                                                |


## 👤 Author
**Satyam Yadav**  






