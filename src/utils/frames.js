export function generateShareText(score, totalQuestions, percentage, category) {
  const emoji = getCategoryEmoji(category)
  return `🧠 I scored ${score}/${totalQuestions} (${percentage}%) on the Farcaster Profile IQ Quiz! ${emoji}\n\nI'm a "${category}" - how well do you know the Farcaster community?\n\nTake the quiz: https://brains.vercel.app`
}

export function generateChallengeText(username) {
  return `🧠 Hey @${username}! I just took the Farcaster Profile IQ Quiz and scored well. Think you can beat my score? \n\nTest your knowledge of the Farcaster community: https://brains.vercel.app\n\n#Farcaster #Quiz #Community`
}

function getCategoryEmoji(category) {
  const emojiMap = {
    'Farcaster Expert': '🏆',
    'Active Member': '⭐',
    'Casual Observer': '👀',
    'Getting Started': '🌱',
    'New to Farcaster': '🆕'
  }
  return emojiMap[category] || '🧠'
}