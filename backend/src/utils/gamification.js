// XP Calculation with streak multiplier
exports.calculateXP = (score, difficulty, streak = 0) => {
  const baseXP = Math.round(score * (1 + difficulty * 0.25));
  const streakMultiplier = streak > 0 ? 1 + Math.min(streak * 0.05, 0.5) : 1; // Max 50% bonus
  return Math.round(baseXP * streakMultiplier);
};

// Level calculation (500 XP per level)
exports.calculateLevel = (xp) => {
  return Math.floor(xp / 500) + 1;
};

// Tier calculation based on level
exports.calculateTier = (level) => {
  if (level >= 50) return "diamond";
  if (level >= 30) return "platinum";
  if (level >= 20) return "gold";
  if (level >= 10) return "silver";
  return "bronze";
};

// Badge assignment
exports.assignBadges = ({ score, verdictCorrect, matchedClues, user, streak }) => {
  const newBadges = [];

  // First Mission
  if (user.missionsCompleted === 0) {
    newBadges.push("🏁 First Mission");
  }

  // Score-based badges
  if (score >= 90) {
    newBadges.push("⭐ Perfect Score");
  } else if (score >= 80) {
    newBadges.push("🧠 Sharp Mind");
  }

  // Investigation badges
  if (verdictCorrect && matchedClues.length >= 2) {
    newBadges.push("🔍 Eagle Eye");
  }
  if (matchedClues.length >= 4) {
    newBadges.push("🕵️ Master Detective");
  }

  // Streak badges
  if (streak >= 7) {
    newBadges.push("🔥 Week Warrior");
  }
  if (streak >= 30) {
    newBadges.push("💪 Monthly Champion");
  }

  // Milestone badges
  if (user.missionsCompleted + 1 === 5) {
    newBadges.push("🎯 5 Missions");
  }
  if (user.missionsCompleted + 1 === 10) {
    newBadges.push("🎖️ 10 Missions");
  }
  if (user.missionsCompleted + 1 === 25) {
    newBadges.push("🏆 25 Missions");
  }
  if (user.missionsCompleted + 1 === 50) {
    newBadges.push("👑 50 Missions");
  }
  if (user.missionsCompleted + 1 === 100) {
    newBadges.push("🌟 Century Club");
  }

  // Level up badges
  const newLevel = exports.calculateLevel(user.xp);
  if (newLevel >= 5 && user.level < 5) {
    newBadges.push("📈 Level 5");
  }
  if (newLevel >= 10 && user.level < 10) {
    newBadges.push("🥈 Silver Tier");
  }
  if (newLevel >= 20 && user.level < 20) {
    newBadges.push("🥇 Gold Tier");
  }
  if (newLevel >= 30 && user.level < 30) {
    newBadges.push("💎 Platinum Tier");
  }
  if (newLevel >= 50 && user.level < 50) {
    newBadges.push("💠 Diamond Elite");
  }

  // Accuracy badges (check after this mission)
  const totalDecisions = user.totalDecisions + 1;
  const correctDecisions = user.correctDecisions + (verdictCorrect ? 1 : 0);
  const accuracy = Math.round((correctDecisions / totalDecisions) * 100);

  if (accuracy >= 90 && totalDecisions >= 10) {
    if (!user.badges.includes("🎯 Sharpshooter")) {
      newBadges.push("🎯 Sharpshooter");
    }
  }

  // Filter out already earned badges
  return newBadges.filter(badge => !user.badges.includes(badge));
};

// Streak multiplier for display
exports.getStreakMultiplier = (streak) => {
  if (streak <= 0) return 1;
  return 1 + Math.min(streak * 0.05, 0.5);
};

// XP required for next level
exports.xpForLevel = (level) => {
  return level * 500;
};

// XP progress within current level
exports.xpProgress = (xp) => {
  return xp % 500;
};
