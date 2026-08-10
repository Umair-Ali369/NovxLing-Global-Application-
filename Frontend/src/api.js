const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
}

// REGISTER USER
export async function registerUser(formData) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      language: formData.language,
      age: formData.age ? Number(formData.age) : null,
    }),
  });
}

// LOGIN USER
export async function loginUser(email, password) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login Failed");
  }

  return data;
}

// PROFILE PAGE
export async function getProfile(token) {
  return request("/profile", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// GET CONVERSATIONS ALL
export async function getConversations(token) {
  return request("/conversations", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// CREATE CONVERSAIONS
export async function createConversations(token, participantID) {
  return request("/conversations", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ participant_id: participantID }),
  });
}

// SEND MESSAGE TO START CONVERSTAIONS
export async function sendMessage(token, conversationId, content) {
  return request("/messages", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ conversation_id: conversationId, content }),
  });
}

// GET CONVERSATION MESSAGE SPECIFIC
export async function getMessages(token, conversation_id) {
  return request(`/conversation/${conversation_id}/messages`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// LOGOUT USER
export async function logoutUser() {
  return request("/logout", {
    method: "POST",
  });
}
