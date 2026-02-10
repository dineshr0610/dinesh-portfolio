/**
 * Mobile Gesture Navigation Composable
 * Detects "force scroll" / overscroll gestures at the top and bottom of the page
 * to navigate between sections.
 */
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useGestureNavigation() {
    const router = useRouter()
    const route = useRoute()

    // Navigation Order
    const order = [
        '/',              // Home
        '/about',         // About
        '/achievements',  // Achievements
        '/timeline',      // Timeline
        '/gallery',       // Gallery
        '/updates',       // Dinesh Now
        '/contact'        // Contact (Final destination)
    ]

    let startY = 0
    let isTouching = false

    function getPrevPage() {
        const currentIndex = order.indexOf(route.path)
        if (currentIndex > 0) return order[currentIndex - 1]
        return null
    }

    function getNextPage() {
        const currentIndex = order.indexOf(route.path)
        if (currentIndex !== -1 && currentIndex < order.length - 1) return order[currentIndex + 1]
        return null
    }

    function handleTouchStart(e: TouchEvent) {
        if (e.touches.length !== 1 || !e.touches[0]) return
        const touch = e.touches[0]
        if (!touch) return
        startY = touch.clientY
        isTouching = true
    }

    function handleTouchEnd(e: TouchEvent) {
        if (!isTouching) return
        isTouching = false

        if (!e.changedTouches[0]) return
        const touch = e.changedTouches[0]
        if (!touch) return

        const endY = touch.clientY
        const diff = startY - endY // positive = scrolling down, negative = scrolling up

        const el = document.scrollingElement || document.documentElement

        // Check if at top
        const atTop = el.scrollTop <= 2 // tolerance

        // Check if at bottom
        // We use a larger tolerance for bottom because different browsers handle scrollHeight differently
        const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight - 5

        // Force Scroll DOWN (Gesture UP) from BOTTOM -> Next Page
        if (atBottom && diff > 80) { // Threshold for gesture
            const next = getNextPage()
            if (next) {
                console.log('Gesture nav -> Next:', next)
                router.push(next)
            }
        }

        // Force Scroll UP (Gesture DOWN) from TOP -> Prev Page
        if (atTop && diff < -80) { // Threshold for gesture
            const prev = getPrevPage()
            if (prev) {
                console.log('Gesture nav -> Prev:', prev)
                router.push(prev)
            }
        }
    }

    // Optional: Wheel support for desktop touchpads (often treated as wheel)
    // or simple mouse scrolling overshoot. 

    let lastWheelTime = 0
    function handleWheel(e: WheelEvent) {
        // Only enable if needed or if specific requirement (User said "Mobile only" mainly, but mentioned "Force scroll")
        // Keeping it simple for now as requested "Mobile Touch Support" explicitly.
        // If we want desktop trackpad support aka "Magic Mouse swipe", we can add it here.
    }

    onMounted(() => {
        // Only attach on mobile/touch devices or generally if we want this behavior
        window.addEventListener('touchstart', handleTouchStart, { passive: true })
        window.addEventListener('touchend', handleTouchEnd, { passive: true })
    })

    onUnmounted(() => {
        window.removeEventListener('touchstart', handleTouchStart)
        window.removeEventListener('touchend', handleTouchEnd)
    })
}
