const API_URL = import.meta.env.VITE_API_URL;

export async function register({ name, email, password, password_confirmation }) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, password_confirmation })
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    // Handle validation errors
    if (res.status === 422 && data.details) {
      const errorMessages = Object.values(data.details)
        .flat()
        .join('. ');
      throw new Error(errorMessages);
    }
    throw new Error(data.error || 'Registration failed');
  }
  
  return data;
}

export async function login({ email, password }) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = await res.json();

  if (!res.ok) {
    if (res.status === 429) throw new Error(payload.error);
    if (res.status === 401) throw new Error("Invalid credentials");
    throw new Error(payload.error || "Login failed");
  }

  // Return exactly these keys:
  return {
    user:          payload.user,
    accessToken:   payload.access_token,
    refreshToken:  payload.refresh_token,
    expiresIn:     payload.expires_in,
  };
}


export async function checkPasswordStrength(password) {
  const res = await fetch(`${API_URL}/check-password-strength`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Password check failed');
  }
  
  const data = await res.json();
  
  // Map backend score (0-100) to frontend's 0-4 scale
  const score = Math.min(4, Math.floor(data.score / 25));
  
  return {
    ...data,
    score,
    feedback: data.errors?.join(' ') || ''
  };
}