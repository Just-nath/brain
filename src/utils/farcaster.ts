export interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  followerCount?: number
}

export interface QuizQuestion {
  question: string
  correctAnswer: string
  options: string[]
  user: FarcasterUser
  profilePictureUrl: string
}

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || ""

/** Fetch top Farcaster users with 2000+ followers */
export async function fetchTopFarcasterUsers(limit = 10): Promise<FarcasterUser[]> {
  try {
    const res = await fetch(`https://api.neynar.com/v2/farcaster/user/search?q=a&limit=${limit}`, {
      headers: { api_key: NEYNAR_API_KEY },
    })
    if (!res.ok) throw new Error(`Neynar API error: ${res.status}`)
    const data = await res.json()

    return data.result.users
      .filter((u: { follower_count: number }) => u.follower_count > 2000)
      .map((u: { fid: number; username: string; display_name?: string; pfp_url?: string; follower_count: number }) => ({
        fid: u.fid,
        username: u.username,
        displayName: u.display_name || u.username,
        pfpUrl: u.pfp_url || "/icon.png",
        followerCount: u.follower_count,
      }))
  } catch (err) {
    console.error("Failed to fetch Farcaster users:", err)
    // Return mock data for development
    return generateMockUsers(limit)
  }
}

/** Generate quiz questions from Farcaster users */
export async function generateQuizDataAsync(count = 10): Promise<QuizQuestion[]> {
  const users = await fetchTopFarcasterUsers(count * 2)
  if (users.length < 4) {
    throw new Error("Not enough Farcaster users available")
  }

  const questions: QuizQuestion[] = []
  const usedUsers = new Set<number>()

  for (let i = 0; i < count; i++) {
    // Find an unused user
    let correctUser: FarcasterUser
    do {
      correctUser = users[Math.floor(Math.random() * users.length)]
    } while (usedUsers.has(correctUser.fid) && usedUsers.size < users.length)
    
    usedUsers.add(correctUser.fid)

    const wrongOptions = users
      .filter((u) => u.fid !== correctUser.fid)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((u) => u.username)

    const options = [...wrongOptions, correctUser.username].sort(() => Math.random() - 0.5)

    questions.push({
      question: `Who is this Farcaster user?`,
      correctAnswer: correctUser.username,
      options,
      user: correctUser,
      profilePictureUrl: correctUser.pfpUrl,
    })
  }

  return questions
}

/** Generate mock users for development/fallback */
function generateMockUsers(count: number): FarcasterUser[] {
  const mockUsers = [
    { username: "vitalik", displayName: "Vitalik Buterin", pfpUrl: "/icon.png" },
    { username: "dwr", displayName: "Dan Romero", pfpUrl: "/icon.png" },
    { username: "jessepollak", displayName: "Jesse Pollak", pfpUrl: "/icon.png" },
    { username: "rish", displayName: "Rish", pfpUrl: "/icon.png" },
    { username: "dankrad", displayName: "Dankrad Feist", pfpUrl: "/icon.png" },
    { username: "justin", displayName: "Justin", pfpUrl: "/icon.png" },
    { username: "lindajxie", displayName: "Linda Xie", pfpUrl: "/icon.png" },
    { username: "brian", displayName: "Brian", pfpUrl: "/icon.png" },
    { username: "alex", displayName: "Alex", pfpUrl: "/icon.png" },
    { username: "sarah", displayName: "Sarah", pfpUrl: "/icon.png" },
  ]

  return mockUsers.slice(0, count).map((user, index) => ({
    fid: index + 1,
    username: user.username,
    displayName: user.displayName,
    pfpUrl: user.pfpUrl,
    followerCount: Math.floor(Math.random() * 50000) + 2000,
  }))
}