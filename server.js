const express = require("express"); 
// Imports Express so we can create a web server and routes.

const path = require("path"); 
// Imports Path so we can safely build file paths like "views.html" or "login.html".

const fs = require("fs"); 
// Imports File System so we can read and write JSON files like bookings.json and users.json.

const session = require("express-session"); 
// Imports session support so users can stay logged in after they log in.

const app = express(); 
// Creates the Express app. This is the main server object.

const PORT = process.env.PORT || 3000; 
// Uses Render's port in deployment, or 3000 locally if no environment port exists.

const bookingsFile = path.join(__dirname, "bookings.json"); 
// Creates the full path to bookings.json.

const usersFile = path.join(__dirname, "users.json"); 
// Creates the full path to users.json.

if (!fs.existsSync(bookingsFile)) {
  fs.writeFileSync(bookingsFile, "[]", "utf8");
}
// If bookings.json does not exist yet, create it and put an empty array inside.

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]", "utf8");
}
// If users.json does not exist yet, create it and put an empty array inside.

app.use(express.urlencoded({ extended: true })); 
// Lets Express read form data from HTML forms that use method="POST".

app.use(express.json()); 
// Lets Express read JSON data if sent from JavaScript/fetch/API calls.

app.use(
  session({
    secret: "audrey-braids-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true
    }
  })
);
// Sets up login sessions.
// secret = signs the session cookie
// resave = don't save session again if nothing changed
// saveUninitialized = don't create useless empty sessions
// maxAge = keep user logged in for 7 days
// httpOnly = makes cookie harder for browser JavaScript to steal

app.use(express.static(__dirname)); 
// Serves static files from the current folder, like HTML, CSS, JS, and images.

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send("Unauthorized");
  }
  next();
}
// Middleware that only allows admins through.
// If user is not logged in or not admin, stop them.
// next() means "continue to the real route".

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}
// Middleware that only allows logged-in users through.

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
// When someone visits the home URL, send index.html.

app.get("/appointment", (req, res) => {
  res.sendFile(path.join(__dirname, "appointment.html"));
});
// Shows the booking page.

app.get("/login", (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      return res.redirect("/view");
    }
    return res.redirect("/");
  }

  res.sendFile(path.join(__dirname, "login.html"));
});
// Shows login page.
// If user is already logged in, don't show login again.
// Send admins to admin page, normal users to home.

app.get("/register", (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      return res.redirect("/view");
    }
    return res.redirect("/");
  }

  res.sendFile(path.join(__dirname, "register.html"));
});
// Shows sign-up page.
// If user is already logged in, redirect them instead.

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    username: req.session.user.username,
    role: req.session.user.role
  });
});
// Returns info about the currently logged-in user.
// Frontend uses this to know if someone is logged in and whether they are admin.

app.post("/register", (req, res) => {
  const { username, password } = req.body;
// Pulls username and password out of submitted form data.

  if (!username || !password) {
    return res.send("Username and password are required.");
  }
// Makes sure both fields were filled in.

  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
// Reads users.json and turns the JSON text into a real JavaScript array.

  const existingUser = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
// Checks whether a user with the same username already exists.

  if (existingUser) {
    return res.send("User already exists.");
  }
// Stops duplicate usernames.

  const role = users.length === 0 ? "admin" : "customer";
// First registered user becomes admin.
// Everyone after that becomes customer.

  users.push({
    id: Date.now(),
    username,
    password,
    role
  });
// Adds the new user into the users array.

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
// Saves the updated users array back into users.json.

  res.redirect("/login");
});
// After sign-up, send the user to the login page.

app.post("/login", (req, res) => {
  const { username, password } = req.body;
// Pulls submitted username and password from form data.

  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
// Loads all users from users.json.

  const user = users.find(
    (u) => u.username === username && u.password === password
  );
// Looks for a matching user whose username and password match exactly.

  if (!user) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login Failed</title>
        <link rel="stylesheet" href="/login.css">
      </head>
      <body>
        <div class="login-box">
          <h1>Wrong username or password</h1>
          <a href="/login">Try again</a>
        </div>
      </body>
      </html>
    `);
  }
// If no matching user is found, show login failed page.

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role
  };
// Stores the logged-in user in the session.
// This is what keeps them logged in.

  if (user.role === "admin") {
    return res.redirect("/view");
  }
// If user is admin, send them to admin page.

  res.redirect("/");
});
// If user is not admin, send them to homepage.

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});
// Destroys the session completely, logging the user out.

app.post("/book", (req, res) => {
  const { styles, phone, client, appointmentDate } = req.body;
// Pulls appointment fields out of the submitted form.

  if (!styles || !phone || !client || !appointmentDate) {
    return res.status(400).send("All fields are required.");
  }
// Makes sure every booking field was filled in.

  const newBooking = {
    id: Date.now(),
    styles,
    phone,
    client,
    appointmentDate,
    createdAt: new Date().toLocaleString()
  };
// Creates a new appointment object.
// id = unique identifier
// createdAt = time it was submitted

  try {
    const currentBookings = JSON.parse(fs.readFileSync(bookingsFile, "utf8"));
// Reads bookings.json into a real array.

    currentBookings.push(newBooking);
// Adds the new booking to the array.

    fs.writeFileSync(
      bookingsFile,
      JSON.stringify(currentBookings, null, 2),
      "utf8"
    );
// Saves the updated booking list back into bookings.json.

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Saved</title>
        <link rel="stylesheet" href="/login.css">
      </head>
      <body>
        <div class="login-box">
          <h1>Booking saved successfully ✅</h1>
          <p>Your request has been received.</p>
          <a href="/appointment">Go back</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).send("Could not save booking.");
  }
});
// Saves a booking and shows success page.
// try/catch prevents the server from crashing if file reading/writing fails.

app.get("/view", requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "views.html"));
});
// Sends the admin appointments page, but only if user is admin.

app.get("/api/bookings", requireAdmin, (req, res) => {
  try {
    const bookings = JSON.parse(fs.readFileSync(bookingsFile, "utf8"));
    res.json(bookings);
  } catch (error) {
    console.error("Error reading bookings:", error);
    res.status(500).json({ error: "Could not load bookings" });
  }
});
// Returns all bookings as JSON, but only for admin.
// views.html uses this with fetch().

app.delete("/api/bookings/:id", requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
// Reads the booking id from the URL and turns it into a number.

  try {
    const bookings = JSON.parse(fs.readFileSync(bookingsFile, "utf8"));
// Loads all bookings.

    const updatedBookings = bookings.filter((b) => b.id !== id);
// Creates a new array that removes the booking with the matching id.

    fs.writeFileSync(
      bookingsFile,
      JSON.stringify(updatedBookings, null, 2),
      "utf8"
    );
// Saves the remaining bookings back into bookings.json.

    res.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete" });
  }
});
// Deletes a booking by id, but only if the user is admin.

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// Starts the server and listens for incoming requests.