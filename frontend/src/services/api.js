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

// World Map - Regions and Quests
export const getRegions = async () => {
  const res = await fetch(`${API_BASE}/world-map/regions`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getRegionById = async (id) => {
  const res = await fetch(`${API_BASE}/world-map/regions/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getQuestById = async (id) => {
  const res = await fetch(`${API_BASE}/world-map/quests/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const completeQuest = async (questId, score) => {
  const res = await fetch(`${API_BASE}/world-map/quests/${questId}/complete`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ score }),
  });
  return res.json();
};

export const getUserProgress = async () => {
  const res = await fetch(`${API_BASE}/world-map/progress`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Achievements
export const getAllAchievements = async () => {
  const res = await fetch(`${API_BASE}/achievements`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getUserAchievements = async (userId) => {
  const endpoint = userId ? `/achievements/user/${userId}` : '/achievements/user';
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const toggleAchievementShowcase = async (achievementId) => {
  const res = await fetch(`${API_BASE}/achievements/${achievementId}/showcase`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getRecentAchievements = async () => {
  const res = await fetch(`${API_BASE}/achievements/recent`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const markAchievementViewed = async (achievementId) => {
  const res = await fetch(`${API_BASE}/achievements/${achievementId}/viewed`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Daily Challenges
export const getTodayChallenge = async () => {
  const res = await fetch(`${API_BASE}/daily/today`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const completeDailyChallenge = async (score, timeSpent) => {
  const res = await fetch(`${API_BASE}/daily/complete`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ score, timeSpent }),
  });
  return res.json();
};

export const getDailyHistory = async () => {
  const res = await fetch(`${API_BASE}/daily/history`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// ==========================================
// LOCALIZED THREAT TRAINING
// ==========================================

export const getLocalizedScenarios = async (options = {}) => {
  const params = new URLSearchParams(options).toString();
  const url = params ? `${API_BASE}/locale/scenarios?${params}` : `${API_BASE}/locale/scenarios`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getRandomScenario = async (options = {}) => {
  const params = new URLSearchParams(options).toString();
  const url = params ? `${API_BASE}/locale/scenarios/random?${params}` : `${API_BASE}/locale/scenarios/random`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const submitScenarioAnswer = async (scenarioId, answer, timeSpent) => {
  const res = await fetch(`${API_BASE}/locale/scenarios/${scenarioId}/answer`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ answer, timeSpent }),
  });
  return res.json();
};

export const getLocaleCategories = async () => {
  const res = await fetch(`${API_BASE}/locale/categories`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const updateUserLocale = async (locale) => {
  const res = await fetch(`${API_BASE}/locale/preference`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ locale }),
  });
  return res.json();
};

export const getLocaleStats = async () => {
  const res = await fetch(`${API_BASE}/locale/stats`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// ==========================================
// COGNITIVE BIAS TRAINING
// ==========================================

export const getAllBiases = async () => {
  const res = await fetch(`${API_BASE}/cognitive-bias`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getBiasDetails = async (biasId) => {
  const res = await fetch(`${API_BASE}/cognitive-bias/${biasId}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getBiasExercise = async (biasId, exerciseIndex) => {
  const res = await fetch(`${API_BASE}/cognitive-bias/${biasId}/exercise/${exerciseIndex}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const submitBiasExerciseAnswer = async (biasId, exerciseIndex, selectedOption) => {
  const res = await fetch(`${API_BASE}/cognitive-bias/${biasId}/exercise/${exerciseIndex}/answer`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ selectedOption }),
  });
  return res.json();
};

export const getBiasProgress = async () => {
  const res = await fetch(`${API_BASE}/cognitive-bias/progress`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const resetBiasProgress = async (biasId = null) => {
  const url = biasId
    ? `${API_BASE}/cognitive-bias/progress/${biasId}`
    : `${API_BASE}/cognitive-bias/progress`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
};

// ==========================================
// CYBER DEFENSE SCORE
// ==========================================

export const generateCyberScore = async () => {
  const res = await fetch(`${API_BASE}/score/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getLatestCyberScore = async () => {
  const res = await fetch(`${API_BASE}/score/latest`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const verifyCyberScore = async (token) => {
  const res = await fetch(`${API_BASE}/score/verify/${token}`);
  return res.json();
};

export const getCyberScoreHistory = async () => {
  const res = await fetch(`${API_BASE}/score/history`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getCyberScoreLeaderboard = async (limit = 20) => {
  const res = await fetch(`${API_BASE}/score/leaderboard?limit=${limit}`);
  return res.json();
};

export const trackScoreView = async (token) => {
  const res = await fetch(`${API_BASE}/score/view/${token}`, {
    method: "POST",
  });
  return res.json();
};
