// Use environment variable for production, fallback to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper for API calls with error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "API request failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth
export const registerUser = async (userData) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
};

export const loginUser = async (credentials) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return res.json();
};

// User
export const getCurrentUser = async () => {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getLeaderboard = async () => {
  const res = await fetch(`${API_BASE}/users/leaderboard`);
  return res.json();
};

// Missions
export const getMissions = async () => {
  const res = await fetch(`${API_BASE}/missions`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getMissionById = async (id) => {
  const res = await fetch(`${API_BASE}/missions/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Submissions
export const submitMission = async (submissionData) => {
  const res = await fetch(`${API_BASE}/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(submissionData),
  });
  return res.json();
};

// Admin
export const createMission = async (missionData) => {
  const res = await fetch(`${API_BASE}/missions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(missionData),
  });
  return res.json();
};

// User Stats
export const getUserStats = async (userId) => {
  const res = await fetch(`${API_BASE}/users/${userId}/stats`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getUserHistory = async (userId, page = 1) => {
  const res = await fetch(`${API_BASE}/users/${userId}/history?page=${page}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Auth helpers
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
};

// Questions
export const getQuestions = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${API_BASE}/questions?${params}` : `${API_BASE}/questions`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getQuestionById = async (id) => {
  const res = await fetch(`${API_BASE}/questions/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const submitQuestionAnswer = async (questionId, selectedAnswers, userId) => {
  const res = await fetch(`${API_BASE}/questions/${questionId}/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      selectedAnswers,
      userId
    }),
  });
  return res.json();
};

export const createQuestion = async (questionData) => {
  const res = await fetch(`${API_BASE}/questions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(questionData),
  });
  return res.json();
};

export const getQuestionStats = async () => {
  const res = await fetch(`${API_BASE}/questions/stats`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

