exports.calculateXP = (score, difficulty) => {
  return Math.round(score * (1 + difficulty * 0.25));
};

exports.calculateLevel = (xp) => {
  return Math.floor(xp / 500) + 1;
};

exports.assignBadges = ({ score, verdictCorrect, matchedClues, user }) => {
  const newBadges = [];

  if (user.missionsCompleted === 0) {
    newBadges.push("🏁 First Mission");
  }

  if (score >= 80) {
    newBadges.push("🧠 Header Hero");
  }

  if (verdictCorrect && matchedClues.length >= 2) {
    newBadges.push("🔍 Sharp Eye");
  }

  return newBadges.filter(badge => !user.badges.includes(badge));
};
