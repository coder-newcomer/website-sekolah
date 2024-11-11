// src/routes/api/login.js
import { query } from "../../db/index";
import bcrypt from "bcryptjs"; // For password hashing comparison

export async function POST({ request }) {
  const { username, password } = await request.json();

  // Retrieve user from the database
  const results = await query("SELECT * FROM users WHERE username = ?", [username]);
  const user = results[0];

  // Check if user exists and password matches
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return json({ error: "Invalid username or password" }, { status: 401 });
  }

  // Set session data (assumes you have some session setup available)
  request.session.set("user", { id: user.id, username: user.username });
  return json({ message: "Login successful", user: { id: user.id, username: user.username } });
}

export default createHandler({ POST });
