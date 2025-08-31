// Farcaster Frame generation utilities

export function generateFrameUrl(score, totalQuestions, percentage, category) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'
  
  const params = new URLSearchParams({
    frame: '1',
    score: score.toString(),
    total: totalQuestions.toString(),
    percentage: percentage.toString(),
    category: encodeURIComponent(category)
  })
  
  return `${baseUrl}/frame?${params.toString()}`
}

export function generateFrameMetadata(score, totalQuestions, percentage, category) {
  const title = `Brains Quiz: ${score}/${totalQuestions} (${percentage}%)`
  const description = `I'm a ${category} on the Farcaster Profile IQ Quiz! Can you beat my score?`
  
  return {
    title,
    description,
    image: generateFrameImageUrl(score, totalQuestions, percentage, category),
    buttons: [
      {
        label: 'Take Quiz',
        action: 'post'
      },
      {
        label: 'View Results',
        action: 'post_redirect'
      }
    ]
  }
}

export function generateFrameImageUrl(score, totalQuestions, percentage, category) {
  // In a real implementation, this would generate a dynamic image
  // For now, return a static image with score info
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'
  
  const params = new URLSearchParams({
    score: score.toString(),
    total: totalQuestions.toString(),
    percentage: percentage.toString(),
    category: encodeURIComponent(category)
  })
  
  return `${baseUrl}/api/frame-image?${params.toString()}`
}

export function generateShareText(score, totalQuestions, percentage, category) {
  return `🧠 I just scored ${score}/${totalQuestions} (${percentage}%) on the Brains Farcaster Profile IQ Quiz! I'm a ${category}. Can you beat my score? Take the quiz: ${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}`
}

export function generateChallengeText(username) {
  return `🎯 @${username} challenged you to beat their score on the Brains Farcaster Profile IQ Quiz! Think you can do better? Take the quiz: ${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}`
}

export function getCategoryEmoji(category) {
  switch (category) {
    case 'Farcaster Expert':
      return '🏆'
    case 'Active Community Member':
      return '🔥'
    case 'Casual Observer':
      return '👀'
    case 'Getting Started':
      return '🌱'
    default:
      return '🎯'
  }
}

export function getCategoryColor(category) {
  switch (category) {
    case 'Farcaster Expert':
      return '#10b981' // green
    case 'Active Community Member':
      return '#3b82f6' // blue
    case 'Casual Observer':
      return '#f59e0b' // yellow
    case 'Getting Started':
      return '#f97316' // orange
    default:
      return '#6b7280' // gray
  }
}

