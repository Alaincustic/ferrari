const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios"); // Import axios for making HTTP requests
const app = express();
const PORT = 3000 || process.env.PORT;

// List of allowed frontend origins for CORS and allowed referrers
const allowedOrigins = [
  "https://heiwajima.in/",
  "http://heiwajima.in/",
  "https://heiwajima.in",
  "http://heiwajima.in",
  "http://127.0.0.1:5501",
  "http://127.0.0.1:5500",
];

const allowedReferrers = [...allowedOrigins]; // Same as allowedOrigins in this case

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

app.use(cors(corsOptions));

// Middleware to verify country code
const verifyCountryCode = async (req, res, next) => {
  try {
    // Get client IP from request - might need to adjust if behind a proxy
    const clientIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Replace 'YOUR_API_KEY' with your actual API key if required
    const response = await axios.get(
      `http://ip-api.com/json/${clientIP}?fields=countryCode`
    );

    console.log("Country Code: " + response.data.countryCode);
    if (response.data.countryCode === "IN") {
      next(); // Continue if user is from Japan
    } else {
      res.status(403).send("Access restricted to users from India");
    }
  } catch (error) {
    console.error("Error verifying country code:", error);
    res.status(500).send("Internal server error");
  }
};

// Check against the allowedReferrers and verify country code
app.get(
  "/",
  verifyCountryCode,
  (req, res, next) => {
    const referer = req.headers.referer;

    if (
      referer &&
      allowedReferrers.some((domain) => referer.startsWith(domain))
    ) {
      next();
    } else {
      res.status(403).send("Access forbidden");
    }
  },
  (req, res) => {
    // File serving logic here
    res.sendFile(path.join(__dirname, "altmod.html"));
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
