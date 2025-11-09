// server.js - SQLITE VERSION

const express = require("express");
const path = require("path");
// [CHANGE 1]: Use sqlite3 driver
const sqlite3 = require("sqlite3").verbose();
// [CHANGE 2]: The database is a single file created in your project folder
const db = new sqlite3.Database("./studentstay.db");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
// --- 1. SQLITE DATABASE INITIALIZATION ---

async function initializeDB() {
  console.log("SQLite Database Connected Successfully!");

  // [CHANGE 3]: Use db.serialize() to ensure commands run sequentially
  db.serialize(() => {
    // --- Create Users Table (SQLite Syntax) ---
    // IDENTITY(1,1) replaced with INTEGER PRIMARY KEY AUTOINCREMENT
    db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK (role IN ('Student', 'Owner')) DEFAULT 'Student',
            registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
        );`);

    // --- Create Bookings Table (SQLite Syntax) ---
    // FOREIGN KEY constraint is simplified, GETDATE() replaced with CURRENT_TIMESTAMP
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            user_name TEXT,
            property_name TEXT NOT NULL,
            sharing_type TEXT,
            num_persons INTEGER,
            advance_payment TEXT,
            booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT CHECK (status IN ('Pending', 'Confirmed', 'Cancelled')) DEFAULT 'Pending'
        );`);
    console.log("Database tables ensured (users, bookings).");
  });
}
initializeDB();

// --- 2. MIDDLEWARE & STATIC FILES ---
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 3. MOCK PROPERTY DATA (Served via GET /api/properties)
const propertiesData = [
  {
    id: 1,
    name: "PG for Boys, Palacharla - Rajahmundry",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    sharing: "4 Sharing",
    beds: 4,
    food: true,
    wifi: true,
    laundry: false,
    price: "₹3,999",
    advance: "₹2,000",
    rating: 4.5,
    reviews: "50 Reviews",
    location: "Rajahmundry",
    landmark: "Near BVC College, 1.5km",
    distance: "5.6km",
    keywords: "BVC COLLEGE, GIET COLLEGE, Rajahmundry, Palacharla",
  },
  {
    id: 2,
    name: "Rayudu Hostels, PG for Girls - Diwancheruvu",
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
    sharing: "3 Sharing",
    beds: 3,
    food: true,
    wifi: false,
    laundry: true,
    price: "₹2,999",
    advance: "₹1,500",
    rating: 4.8,
    reviews: "120 Reviews",
    location: "Rajahmundry",
    landmark: "Near GIET Campus,0.9km",
    distance: "8.9km",
    keywords: "GIET Campus, BVC Campus, Rajahmundry, Diwancheruvu",
  },
  {
    id: 3,
    name: "Sriram Residency, Budget PG - Kakinada",
    image:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
    sharing: "6 Sharing",
    beds: 6,
    food: true,
    wifi: true,
    laundry: false,
    price: "₹4,999",
    advance: "₹2,500",
    rating: 3.7,
    reviews: "35 Reviews",
    location: "Kakinada",
    landmark: "Near Arts College, 0.8km",
    distance: "7.8km",
    keywords: "Arts College, Aditya College, Kakinada",
  },
  {
    id: 4,
    name: "Surya Palace,Rooms for Boys - Vijayawada",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    sharing: "5 Sharing",
    beds: 5,
    food: true,
    wifi: false,
    laundry: true,
    price: "₹5,499",
    advance: "₹3,750",
    rating: 4.0,
    reviews: "88 Reviews",
    location: "Vijayawada",
    landmark: "Near Siddhartha College, 0.5km",
    distance: "78kms",
    keywords: "Siddhartha College, Vijayawada, vijayawada",
  },
  {
    id: 5,
    name: "RK PG's for Boys, Bhimavaram",
    image:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
    sharing: "Single",
    beds: 1,
    food: false,
    wifi: true,
    laundry: false,
    price: "₹2,999",
    advance: "₹1,500",
    rating: 4.4,
    reviews: "15 Reviews",
    location: "Bhimavaram",
    landmark: "Near VISHNU college, 1.3km",
    distance: "42.5km",
    keywords: "VISHNU college, Bhimavaram",
  },
  {
    id: 6,
    name: "Sita Hostels, Girls PG - Vizag",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    sharing: "3 Sharing",
    beds: 3,
    food: true,
    wifi: true,
    laundry: false,
    price: "₹7,499",
    advance: "₹3,750",
    rating: 3.9,
    reviews: "62 Reviews",
    location: "Vizag",
    landmark: "Near Vizag Univ, 1.6km",
    distance: "230.0km",
    keywords: "Vizag Univ, Metro, Vizag",
  },
];

// --- 4. API ROUTES (UPDATED FOR SQLITE) ---

// GET: Property Data
app.get("/api/properties", (req, res) => {
  res.json(propertiesData);
});

// POST: Property Submission (Console Logging only)
app.post("/api/listings", (req, res) => {
  console.log("--- New Property Listing Submitted (Still Console Logging) ---");
  console.log(req.body);
  res.status(201).json({ message: "Property listing received successfully!" });
});

// POST: User Registration (SAVES TO SQLITE)
app.post("/api/register", (req, res) => {
  const { name, email, phone, password, role } = req.body;

  // [CHANGE 4]: Use db.run for INSERT
  db.run(
    `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
    [name, email, phone, password, role],
    function (err) {
      if (err) {
        console.error("Registration Error:", err.message);

        // --- FIX: IMPROVED ERROR REPORTING ---
        let errorMessage = "Registration failed. Please check all fields.";

        if (err.message.includes("UNIQUE constraint failed: users.email")) {
          errorMessage = "Registration failed. Email is already in use.";
        } else if (err.message.includes("NOT NULL constraint failed")) {
          // This happens if name, phone, or password were sent empty/missing
          errorMessage =
            "Registration failed. One or more required fields (Name, Email, Phone, Password) are missing.";
        }

        return res.status(400).json({ message: errorMessage });
        // --- END FIX ---
      }
      // SQLite way to get the last inserted ID
      const newUserId = this.lastID;
      console.log(
        `--- New User Saved to SQLite: ${email}, ID: ${newUserId} ---`
      );

      // Return the generated user ID for client storage
      res
        .status(201)
        .json({ message: "Registration successful!", userId: newUserId });
    }
  );
});

// POST: User Login (SQLITE check)
app.post("/api/login", (req, res) => {
  const { emailOrPhone, password } = req.body;

  // [CHANGE 5]: Use db.get() for single row lookup
  db.get(
    `SELECT id, name, password FROM users WHERE email = ? OR phone = ?`,
    [emailOrPhone, emailOrPhone],
    (err, user) => {
      if (err) {
        console.error("Login Error:", err.message);
        return res.status(500).json({ message: "Server error during login." });
      }

      if (user && user.password === password) {
        console.log(
          `--- User Login Success: ${emailOrPhone}, ID: ${user.id} ---`
        );
        return res.status(200).json({
          message: "Login successful!",
          userName: user.name,
          userId: user.id,
        });
      }

      res.status(401).json({
        message:
          "Invalid credentials. Please check your email/phone and password.",
      });
    }
  );
});

// --- NEW ENDPOINT FIX: Fetch User Details ---
// GET: User Details (RETRIEVES REAL USER EMAIL/PHONE/ROLE FROM SQLITE)
app.get("/api/users/:userId", (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  db.get(
    `SELECT name, email, phone, role
     FROM users
     WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) {
        console.error("Fetch User Detail Error:", err.message);
        return res
          .status(500)
          .json({ message: "Failed to fetch user details from DB." });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Return the required user details
      res.status(200).json(user);
    }
  );
});
// ------------------------------------------

// POST: Booking Submission (SAVES TO SQLITE)
app.post("/api/bookings", (req, res) => {
  const {
    userId,
    userName,
    propertyName,
    sharingType,
    numPersons,
    advancePayment,
  } = req.body;

  // [CHANGE 6]: Use db.run for INSERT
  db.run(
    `INSERT INTO bookings (user_id, user_name, property_name, sharing_type, num_persons, advance_payment) 
         VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, userName, propertyName, sharingType, numPersons, advancePayment],
    function (err) {
      if (err) {
        console.error("Booking Error:", err.message);
        return res.status(500).json({ message: "Failed to create booking." });
      }
      const bookingId = this.lastID;
      console.log(
        `--- NEW Booking Saved to SQLite for: ${userName}, ID: ${bookingId} ---`
      );

      res.status(201).json({
        message: "Booking submitted successfully. Awaiting confirmation.",
        bookingId: bookingId,
      });
    }
  );
});

// GET: User Bookings Dashboard (RETRIEVES FROM SQLITE)
app.get("/api/users/:userId/bookings", (req, res) => {
  const userId = req.params.userId;

  // [CHANGE 7]: Use db.all() for multiple rows lookup
  db.all(
    `SELECT id AS _id, property_name, sharing_type, num_persons, advance_payment, booking_date, status 
         FROM bookings 
         WHERE user_id = ? 
         ORDER BY booking_date DESC`,
    [userId],
    (err, bookings) => {
      if (err) {
        console.error("Fetch Bookings Error:", err.message);
        return res.status(500).json({ message: "Failed to fetch bookings." });
      }
      res.status(200).json(bookings);
    }
  );
});

// --- 5. START SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Open your browser to: http://localhost:${PORT}/index.html`);
});
