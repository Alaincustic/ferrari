const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = 3000 || process.env.PORT;

// List of allowed frontend origins for CORS
const allowedOrigins = [
  "https://thaibasiljp.com/",
  "http://thaibasiljp.com/",
  "https://thaibasiljp.com",
  "http://thaibasiljp.com",
  "http://127.0.0.1:5501",
  "http://127.0.0.1:5500",
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Apply the CORS middleware
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle the POST request
app.post(
  "/",
  (req, res, next) => {
    const referer = req.headers.referer;

    // Check if the referer exists in the allowedReferrers array
    if (allowedOrigins.includes(referer)) {
      next();
    } else {
      res.status(403).send("Access forbidden due to invalid referer.");
    }
  },
  (req, res) => {
    const { timezone } = req.body;

    if (timezone === "Asia/Tokyo") {
      res.sendFile(path.join(__dirname, "altmod.html"));
    } else {
      res.sendFile(path.join(__dirname, "index.html"));
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
