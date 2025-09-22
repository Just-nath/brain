// Image preloading utility for better performance
export class ImagePreloader {
  private preloadedImages = new Set<string>()
  private failedImages = new Set<string>()

  async preloadImage(src: string): Promise<boolean> {
    // Skip if already preloaded or failed
    if (this.preloadedImages.has(src) || this.failedImages.has(src)) {
      return this.preloadedImages.has(src)
    }

    return new Promise((resolve) => {
      const img = new Image()
      
      img.onload = () => {
        this.preloadedImages.add(src)
        resolve(true)
      }
      
      img.onerror = () => {
        this.failedImages.add(src)
        resolve(false)
      }
      
      // Set timeout to avoid hanging
      setTimeout(() => {
        this.failedImages.add(src)
        resolve(false)
      }, 10000) // 10 second timeout
      
      img.src = src
    })
  }

  async preloadImages(srcs: string[]): Promise<{ success: string[], failed: string[] }> {
    const results = await Promise.allSettled(
      srcs.map(src => this.preloadImage(src))
    )

    const success: string[] = []
    const failed: string[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        success.push(srcs[index])
      } else {
        failed.push(srcs[index])
      }
    })

    return { success, failed }
  }

  isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src)
  }

  hasFailed(src: string): boolean {
    return this.failedImages.has(src)
  }

  clear(): void {
    this.preloadedImages.clear()
    this.failedImages.clear()
  }

  getStats(): { preloaded: number, failed: number } {
    return {
      preloaded: this.preloadedImages.size,
      failed: this.failedImages.size
    }
  }
}

// Singleton instance
export const imagePreloader = new ImagePreloader()

// Utility function to preload profile pictures for quiz questions
export async function preloadQuizImages(questions: any[]): Promise<void> {
  const imageUrls = questions
    .map(q => q.user?.pfpUrl)
    .filter(url => url && url !== '/icon.png')
    .slice(0, 10) // Limit to first 10 images to avoid overwhelming

  if (imageUrls.length > 0) {
    console.log(`Preloading ${imageUrls.length} profile images...`)
    const { success, failed } = await imagePreloader.preloadImages(imageUrls)
    console.log(`Preloaded ${success.length} images successfully, ${failed.length} failed`)
  }
}


