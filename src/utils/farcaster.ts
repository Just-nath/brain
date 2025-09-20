import { getCachedOrFetch, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

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

const NEYNAR_API_KEY = "3367EB2F-69DE-4AF5-9057-68162A77AED3"

/** Validate if a profile picture URL is accessible */
async function validateProfilePicture(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
    return response.ok && response.headers.get('content-type')?.startsWith('image/')
  } catch {
    return false
  }
}

/** Fetch top Farcaster users with 2000+ followers */
export async function fetchTopFarcasterUsers(limit = 50): Promise<FarcasterUser[]> {
  const cacheKey = `${CACHE_KEYS.FARCASTER_USERS}_${limit}`
  
  return getCachedOrFetch(
    cacheKey,
    async () => {
      try {
        // Fetch multiple pages to ensure we have enough users with valid profile pictures
        const allUsers: FarcasterUser[] = []
        let offset = 0
        const pageSize = 100

        while (allUsers.length < limit * 2 && offset < 1000) {
          const res = await fetch(`https://api.neynar.com/v2/farcaster/user/search?q=a&limit=${pageSize}&offset=${offset}`, {
            headers: { 
              'api_key': NEYNAR_API_KEY,
              'Accept': 'application/json'
            },
          })
          
          if (!res.ok) {
            console.error(`Neynar API error: ${res.status}`, await res.text())
            break
          }
          
          const data = await res.json()
          
          if (!data.result?.users || data.result.users.length === 0) {
            break
          }

          // Filter users with 2000+ followers and validate profile pictures
          const validUsers = await Promise.all(
            data.result.users
              .filter((u: any) => u.follower_count >= 2000)
              .map(async (u: any) => {
                const pfpUrl = u.pfp_url || "/icon.png"
                const isValidPfp = pfpUrl !== "/icon.png" && await validateProfilePicture(pfpUrl)
                
                return {
                  fid: u.fid,
                  username: u.username,
                  displayName: u.display_name || u.username,
                  pfpUrl: isValidPfp ? pfpUrl : "/icon.png",
                  followerCount: u.follower_count,
                  isValidPfp
                }
              })
          )

          // Only add users with valid profile pictures
          const validUsersWithPfp = validUsers.filter(user => user.isValidPfp)
          allUsers.push(...validUsersWithPfp.map(({ isValidPfp, ...user }) => user))

          offset += pageSize
        }

        // Remove duplicates and return the requested number
        const uniqueUsers = allUsers.filter((user, index, self) => 
          index === self.findIndex(u => u.fid === user.fid)
        )

        return uniqueUsers.slice(0, limit)

      } catch (err) {
        console.error("Failed to fetch Farcaster users:", err)
        // Return mock data for development
        return generateMockUsers(limit)
      }
    },
    CACHE_TTL.FARCASTER_USERS
  )
}

/** Generate quiz questions from Farcaster users */
export async function generateQuizDataAsync(count = 20): Promise<QuizQuestion[]> {
  // Fetch more users to ensure we have enough for 20 questions with unique users
  const users = await fetchTopFarcasterUsers(count * 3)
  if (users.length < 4) {
    throw new Error("Not enough Farcaster users available")
  }

  const questions: QuizQuestion[] = []
  const usedUsers = new Set<number>()

  for (let i = 0; i < count; i++) {
    // Find an unused user
    let correctUser: FarcasterUser
    let attempts = 0
    do {
      correctUser = users[Math.floor(Math.random() * users.length)]
      attempts++
    } while (usedUsers.has(correctUser.fid) && usedUsers.size < users.length && attempts < 100)
    
    if (attempts >= 100) {
      // If we can't find enough unique users, break
      break
    }
    
    usedUsers.add(correctUser.fid)

    // Get 3 random wrong options from unused users
    const availableUsers = users.filter((u) => u.fid !== correctUser.fid)
    const wrongOptions = availableUsers
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((u) => u.username)

    // Ensure we have 4 options total
    if (wrongOptions.length < 3) {
      // If we don't have enough wrong options, use any available users
      const allOtherUsers = users.filter((u) => u.fid !== correctUser.fid)
      while (wrongOptions.length < 3 && wrongOptions.length < allOtherUsers.length) {
        const randomUser = allOtherUsers[Math.floor(Math.random() * allOtherUsers.length)]
        if (!wrongOptions.includes(randomUser.username)) {
          wrongOptions.push(randomUser.username)
        }
      }
    }

    // Create 4 options in 2x2 grid format (A, B, C, D)
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
    { username: "vitalik", displayName: "Vitalik Buterin", pfpUrl: "https://i.imgur.com/3f2X1.jpg" },
    { username: "dwr", displayName: "Dan Romero", pfpUrl: "https://i.imgur.com/4f3X2.jpg" },
    { username: "jessepollak", displayName: "Jesse Pollak", pfpUrl: "https://i.imgur.com/5f4X3.jpg" },
    { username: "rish", displayName: "Rish", pfpUrl: "https://i.imgur.com/6f5X4.jpg" },
    { username: "dankrad", displayName: "Dankrad Feist", pfpUrl: "https://i.imgur.com/7f6X5.jpg" },
    { username: "justin", displayName: "Justin", pfpUrl: "https://i.imgur.com/8f7X6.jpg" },
    { username: "lindajxie", displayName: "Linda Xie", pfpUrl: "https://i.imgur.com/9f8X7.jpg" },
    { username: "brian", displayName: "Brian", pfpUrl: "https://i.imgur.com/1f9X8.jpg" },
    { username: "alex", displayName: "Alex", pfpUrl: "https://i.imgur.com/2f1X9.jpg" },
    { username: "sarah", displayName: "Sarah", pfpUrl: "https://i.imgur.com/3f2X0.jpg" },
    { username: "mike", displayName: "Mike", pfpUrl: "https://i.imgur.com/4f3X1.jpg" },
    { username: "anna", displayName: "Anna", pfpUrl: "https://i.imgur.com/5f4X2.jpg" },
    { username: "tom", displayName: "Tom", pfpUrl: "https://i.imgur.com/6f5X3.jpg" },
    { username: "emma", displayName: "Emma", pfpUrl: "https://i.imgur.com/7f6X4.jpg" },
    { username: "jake", displayName: "Jake", pfpUrl: "https://i.imgur.com/8f7X5.jpg" },
    { username: "lisa", displayName: "Lisa", pfpUrl: "https://i.imgur.com/9f8X6.jpg" },
    { username: "david", displayName: "David", pfpUrl: "https://i.imgur.com/1f9X7.jpg" },
    { username: "sophie", displayName: "Sophie", pfpUrl: "https://i.imgur.com/2f1X8.jpg" },
    { username: "chris", displayName: "Chris", pfpUrl: "https://i.imgur.com/3f2X9.jpg" },
    { username: "maya", displayName: "Maya", pfpUrl: "https://i.imgur.com/4f3X0.jpg" },
    { username: "ryan", displayName: "Ryan", pfpUrl: "https://i.imgur.com/5f4X1.jpg" },
    { username: "zoe", displayName: "Zoe", pfpUrl: "https://i.imgur.com/6f5X2.jpg" },
    { username: "nick", displayName: "Nick", pfpUrl: "https://i.imgur.com/7f6X3.jpg" },
    { username: "olivia", displayName: "Olivia", pfpUrl: "https://i.imgur.com/8f7X4.jpg" },
    { username: "sam", displayName: "Sam", pfpUrl: "https://i.imgur.com/9f8X5.jpg" },
  ]

  return mockUsers.slice(0, count).map((user, index) => ({
    fid: index + 1,
    username: user.username,
    displayName: user.displayName,
    pfpUrl: user.pfpUrl,
    followerCount: Math.floor(Math.random() * 50000) + 2000,
  }))
}