const BASE_URL = window.location.hostname === "localhost" 
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

export async function loginUser(email, password) {
  const body = new URLSearchParams();
  body.append("username", email)
  body.append("password", password)

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

export async function getProfile(token) {
  return request("/profile", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// NEW - clears the refresh cookie server-side.
export async function logoutUser() {
  return request("/logout", {
    method: "POST",
  });
}
