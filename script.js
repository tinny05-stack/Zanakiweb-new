// Enhanced JavaScript with improved functionality and animations

// Global variables
let isLoading = true
let currentSection = "home"
let animationObserver

// Utility functions
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const throttle = (func, limit) => {
  let inThrottle
  return function () {
    const args = arguments
    
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Loading screen
function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen")
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add("hidden")
      isLoading = false
      initializeAnimations()
    }, 1500)
  }
}

// Counter animation for hero stats
function animateCounters() {
  const counters = document.querySelectorAll("[data-count]")

  counters.forEach((counter) => {
    const target = Number.parseInt(counter.getAttribute("data-count"))
    const duration = 2000
    const increment = target / (duration / 16)
    let current = 0

    const updateCounter = () => {
      if (current < target) {
        current += increment
        counter.textContent = Math.floor(current)
        requestAnimationFrame(updateCounter)
      } else {
        counter.textContent = target
      }
    }

    // Start animation when element is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateCounter()
          observer.unobserve(entry.target)
        }
      })
    })

    observer.observe(counter)
  })
}

// Navigation functionality
function showSection(sectionId) {
  if (isLoading) return

  // Hide all sections with fade out
  const sections = document.querySelectorAll(".section")
  sections.forEach((section) => {
    if (section.classList.contains("active")) {
      section.style.opacity = "0"
      section.style.transform = "translateY(20px)"
      setTimeout(() => {
        section.classList.remove("active")
      }, 300)
    }
  })

  // Show selected section with fade in
  setTimeout(() => {
    const targetSection = document.getElementById(sectionId)
    if (targetSection) {
      targetSection.classList.add("active")
      targetSection.style.opacity = "0"
      targetSection.style.transform = "translateY(20px)"

      requestAnimationFrame(() => {
        targetSection.style.transition = "opacity 0.5s ease, transform 0.5s ease"
        targetSection.style.opacity = "1"
        targetSection.style.transform = "translateY(0)"
      })
    }
  }, 300)

  // Update navigation active state
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.classList.remove("active")
  })

  const activeLink = document.querySelector(`[data-section="${sectionId}"]`)
  if (activeLink) {
    activeLink.classList.add("active")
  }

  // Close mobile menu
  const navMenu = document.getElementById("nav-menu")
  const mobileMenuBtn = document.getElementById("mobile-menu-btn")
  if (navMenu && navMenu.classList.contains("show")) {
    navMenu.classList.remove("show")
    mobileMenuBtn.classList.remove("active")
    document.body.style.overflow = "auto"
  }

  // Update current section
  currentSection = sectionId

  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" })

  // Trigger animations for new section
  setTimeout(() => {
    initializeSectionAnimations(sectionId)
  }, 500)
}

// Mobile menu toggle
function toggleMobileMenu() {
  const navMenu = document.getElementById("nav-menu")
  const mobileMenuBtn = document.getElementById("mobile-menu-btn")

  if (navMenu && mobileMenuBtn) {
    navMenu.classList.toggle("show")
    mobileMenuBtn.classList.toggle("active")

    if (navMenu.classList.contains("show")) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }
}

// Scroll to top functionality
function initializeScrollToTop() {
  const scrollBtn = document.getElementById("scroll-to-top")

  if (scrollBtn) {
    const toggleScrollBtn = throttle(() => {
      if (window.pageYOffset > 300) {
        scrollBtn.classList.add("visible")
      } else {
        scrollBtn.classList.remove("visible")
      }
    }, 100)

    window.addEventListener("scroll", toggleScrollBtn)

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }
}

// Form validation and submission
function handleFormSubmit(event) {
  event.preventDefault()

  // Show loading state
  const submitBtn = event.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = "<span>Sending...</span>"
  submitBtn.disabled = true

  // Clear previous errors
  clearErrors()

  // Get form data
  const formData = new FormData(event.target)
  const name = formData.get("name")?.trim() || ""
  const email = formData.get("email")?.trim() || ""
  const phone = formData.get("phone")?.trim() || ""
  const subject = formData.get("subject")?.trim() || ""
  const message = formData.get("message")?.trim() || ""

  let isValid = true

  // Enhanced validation
  if (name.length < 2) {
    showError("nameError", "Name must be at least 2 characters long")
    isValid = false
  } else if (!/^[a-zA-Z\s]+$/.test(name)) {
    showError("nameError", "Name should only contain letters and spaces")
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showError("emailError", "Please enter a valid email address")
    isValid = false
  }

  if (phone && phone.length > 0) {
    const cleanedPhone = phone.replace(/[\s\-$$$$]/g, "")
    const tanzaniaPhoneRegex = /^(?:\+255|0)[67]\d{8}$/
    if (!tanzaniaPhoneRegex.test(cleanedPhone)) {
      showError("phoneError", "Please enter a valid Tanzanian phone number (e.g. +255712345678 or 0712345678)")
      isValid = false
    }
  }

  if (subject.length < 3) {
    showError("subjectError", "Subject must be at least 3 characters long")
    isValid = false
  }

  if (message.length < 10) {
    showError("messageError", "Message must be at least 10 characters long")
    isValid = false
  }

  // Reset button state
  setTimeout(() => {
    submitBtn.innerHTML = originalText
    submitBtn.disabled = false
  }, 2000)

  if (isValid) {
    // Show success message
    showSuccessMessage("Message sent successfully! We will get back to you soon.")
    event.target.reset()

    // Actually submit the form
    setTimeout(() => {
      event.target.submit()
    }, 1000)
  }
}

function showError(elementId, message) {
  const element = document.getElementById(elementId)
  if (element) {
    element.textContent = message
    element.style.opacity = "0"
    element.style.transform = "translateY(-10px)"

    requestAnimationFrame(() => {
      element.style.transition = "opacity 0.3s ease, transform 0.3s ease"
      element.style.opacity = "1"
      element.style.transform = "translateY(0)"
    })
  }
}

function clearErrors() {
  const errorElements = document.querySelectorAll(".error")
  errorElements.forEach((element) => {
    element.textContent = ""
    element.style.opacity = "0"
  })
}

function showSuccessMessage(message) {
  // Create success notification
  const notification = document.createElement("div")
  notification.className = "success-notification"
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">✅</span>
      <span class="notification-text">${message}</span>
    </div>
  `

  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--success-color);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-heavy);
    z-index: 2000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `

  document.body.appendChild(notification)

  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = "translateX(0)"
  })

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(400px)"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 5000)
}

// Office status checker
function checkOfficeStatus() {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const minutes = now.getMinutes()

  const isWeekend = day === 0 || day === 6
  const isHoliday = isPublicHoliday(now)
  const isWithinHours = (hour > 7 || (hour === 7 && minutes >= 30)) && (hour < 15 || (hour === 15 && minutes <= 30))

  const statusElement = document.getElementById("office-status")

  if (statusElement) {
    let statusHTML = ""
    const statusClass = ""

    if (isWeekend || isHoliday) {
      statusHTML = '<span style="color: #F44336; font-weight: 600;">🔴 Closed (Weekend or Holiday)</span>'
    } else if (isWithinHours) {
      statusHTML = '<span style="color: #4CAF50; font-weight: 600;">🟢 Open Now</span>'
    } else {
      statusHTML = '<span style="color: #FF9800; font-weight: 600;">🟡 Closed (Outside Hours)</span>'
    }

    statusElement.innerHTML = statusHTML
  }
}

function isPublicHoliday(date) {
  const holidays = [
    "01-01", // New Year's Day
    "01-12", // Zanzibar Revolution Day
    "04-07", // Karume Day
    "04-26", // Union Day
    "05-01", // Labour Day
    "07-07", // Saba Saba
    "08-08", // Nane Nane
    "10-14", // Nyerere Day
    "12-09", // Independence Day
    "12-25", // Christmas Day
    "12-26", // Boxing Day
  ]

  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const todayStr = `${month}-${day}`
  return holidays.includes(todayStr)
}

// Animation initialization
function initializeAnimations() {
  // Initialize intersection observer for animations
  animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateY(0)"
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  )

  // Observe all animated elements
  const animatedElements = document.querySelectorAll("[data-aos]")
  animatedElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.8s ease, transform 0.8s ease"
    animationObserver.observe(el)
  })
}

function initializeSectionAnimations(sectionId) {
  const section = document.getElementById(sectionId)
  if (!section) return

  const animatedElements = section.querySelectorAll("[data-aos]")
  animatedElements.forEach((el, index) => {
    setTimeout(() => {
      el.style.opacity = "1"
      el.style.transform = "translateY(0)"
    }, index * 100)
  })
}

// Image modal functionality
function initializeImageModal() {
  const galleryImages = document.querySelectorAll(".gallery-item img")
  const imageModal = document.getElementById("imageModal")
  const modalImg = document.getElementById("modalImg")
  const modalCaption = document.getElementById("modalCaption")
  const modalClose = document.querySelector(".modal-close")

  if (imageModal && modalImg) {
    galleryImages.forEach((img) => {
      img.addEventListener("click", function () {
        const imgSrc = this.src
        const imgAlt = this.alt

        modalImg.src = imgSrc
        modalCaption.textContent = imgAlt
        imageModal.style.display = "flex"

        // Animate modal in
        requestAnimationFrame(() => {
          imageModal.style.opacity = "1"
          modalImg.style.transform = "scale(1)"
        })

        document.body.style.overflow = "hidden"
      })
    })

    // Close modal functionality
    const closeModal = () => {
      imageModal.style.opacity = "0"
      modalImg.style.transform = "scale(0.8)"

      setTimeout(() => {
        imageModal.style.display = "none"
        document.body.style.overflow = "auto"
      }, 300)
    }

    if (modalClose) {
      modalClose.addEventListener("click", closeModal)
    }

    imageModal.addEventListener("click", (e) => {
      if (e.target === imageModal) {
        closeModal()
      }
    })

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && imageModal.style.display === "flex") {
        closeModal()
      }
    })
  }
}

// Enhanced touch interactions
function initializeTouchInteractions() {
  const touchElements = document.querySelectorAll(
    ".btn, .nav-link, .welcome-card, .subject-card, .result-card, .club-card, .achievement-card",
  )

  touchElements.forEach((element) => {
    let touchStartTime
    let touchStartY

    element.addEventListener(
      "touchstart",
      function (e) {
        touchStartTime = Date.now()
        touchStartY = e.touches[0].clientY
        this.style.transform = "scale(0.98)"
        this.style.transition = "transform 0.1s ease"
      },
      { passive: true },
    )

    element.addEventListener(
      "touchend",
      function (e) {
        const touchEndTime = Date.now()
        const touchEndY = e.changedTouches[0].clientY
        const touchDuration = touchEndTime - touchStartTime
        const touchDistance = Math.abs(touchEndY - touchStartY)

        this.style.transform = "scale(1)"
        this.style.transition = "transform 0.2s ease"

        // Only trigger click if it was a quick tap with minimal movement
        if (touchDuration < 200 && touchDistance < 10) {
          // Let the normal click handler take care of the action
        }
      },
      { passive: true },
    )

    element.addEventListener(
      "touchcancel",
      function () {
        this.style.transform = "scale(1)"
        this.style.transition = "transform 0.2s ease"
      },
      { passive: true },
    )
  })
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
  document.documentElement.style.scrollBehavior = "smooth"

  // Enhanced smooth scrolling for better performance
  const smoothScrollTo = (target, duration = 800) => {
    const targetPosition = target
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    let startTime = null

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const run = ease(timeElapsed, startPosition, distance, duration)
      window.scrollTo(0, run)
      if (timeElapsed < duration) requestAnimationFrame(animation)
    }

    function ease(t, b, c, d) {
      t /= d / 2
      if (t < 1) return (c / 2) * t * t + b
      t--
      return (-c / 2) * (t * (t - 2) - 1) + b
    }

    requestAnimationFrame(animation)
  }

  // Apply to scroll to top button
  const scrollToTopBtn = document.getElementById("scroll-to-top")
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", (e) => {
      e.preventDefault()
      smoothScrollTo(0)
    })
  }
}

// Performance optimizations
function initializePerformanceOptimizations() {
  // Lazy load images
  const images = document.querySelectorAll('img[loading="lazy"]')

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.style.opacity = "0"
          img.style.transition = "opacity 0.3s ease"

          img.onload = () => {
            img.style.opacity = "1"
          }

          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach((img) => imageObserver.observe(img))
  }

  // Preload critical resources
  const preloadLinks = ["https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"]

  preloadLinks.forEach((href) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "style"
    link.href = href
    document.head.appendChild(link)
  })
}

// Accessibility enhancements
function initializeAccessibility() {
  // Skip to main content link
  const skipLink = document.createElement("a")
  skipLink.href = "#main"
  skipLink.textContent = "Skip to main content"
  skipLink.className = "skip-link"
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--primary-color);
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 1000;
    transition: top 0.3s;
  `

  skipLink.addEventListener("focus", () => {
    skipLink.style.top = "6px"
  })

  skipLink.addEventListener("blur", () => {
    skipLink.style.top = "-40px"
  })

  document.body.insertBefore(skipLink, document.body.firstChild)

  // Add main landmark
  const main = document.querySelector("main")
  if (main) {
    main.id = "main"
    main.setAttribute("role", "main")
  }

  // Enhance keyboard navigation
  const focusableElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
  )

  focusableElements.forEach((element) => {
    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (element.tagName === "BUTTON" || element.tagName === "A") {
          e.preventDefault()
          element.click()
        }
      }
    })
  })
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎓 Zanaki Secondary School website loaded successfully")

  // Initialize core functionality
  hideLoadingScreen()
  initializeScrollToTop()
  initializeSmoothScrolling()
  initializeImageModal()
  initializeTouchInteractions()
  initializePerformanceOptimizations()
  initializeAccessibility()

  // Mobile menu functionality
  const mobileMenuBtn = document.getElementById("mobile-menu-btn")
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      toggleMobileMenu()
    })

    mobileMenuBtn.addEventListener("touchend", (e) => {
      e.preventDefault()
      e.stopPropagation()
      toggleMobileMenu()
    })
  }

  // Navigation links functionality
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    const handleNavClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      const sectionId = link.getAttribute("data-section")
      if (sectionId) {
        showSection(sectionId)
      }
    }

    link.addEventListener("click", handleNavClick)
    link.addEventListener("touchend", handleNavClick)
  })

  // Navigation buttons (like "Discover Our Story")
  const navBtns = document.querySelectorAll(".nav-btn")
  navBtns.forEach((btn) => {
    const handleBtnClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      const sectionId = btn.getAttribute("data-section")
      if (sectionId) {
        showSection(sectionId)
      }
    }

    btn.addEventListener("click", handleBtnClick)
    btn.addEventListener("touchend", handleBtnClick)
  })

  // Footer navigation links
  const footerNavLinks = document.querySelectorAll("footer [data-section]")
  footerNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const sectionId = link.getAttribute("data-section")
      if (sectionId) {
        showSection(sectionId)
      }
    })
  })

  // Close mobile menu when clicking outside
  document.addEventListener("click", (event) => {
    const navMenu = document.getElementById("nav-menu")
    const mobileMenuBtn = document.getElementById("mobile-menu-btn")

    if (navMenu && mobileMenuBtn) {
      if (!navMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
        navMenu.classList.remove("show")
        mobileMenuBtn.classList.remove("active")
        document.body.style.overflow = "auto"
      }
    }
  })

  // Form submission
  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit)
  }

  // Initialize counters and office status
  setTimeout(() => {
    animateCounters()
    checkOfficeStatus()

    // Update office status every minute
    setInterval(checkOfficeStatus, 60000)
  }, 2000)

  // Handle window resize
  const handleResize = debounce(() => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
      const navMenu = document.getElementById("nav-menu")
      const mobileMenuBtn = document.getElementById("mobile-menu-btn")

      if (navMenu && navMenu.classList.contains("show")) {
        navMenu.classList.remove("show")
        mobileMenuBtn.classList.remove("active")
        document.body.style.overflow = "auto"
      }
    }
  }, 250)

  window.addEventListener("resize", handleResize)

  // Handle visibility change (tab switching)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkOfficeStatus()
    }
  })

  // Add CSS for success notification
  const style = document.createElement("style")
  style.textContent = `
    .notification-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .notification-icon {
      font-size: 1.2rem;
    }
    
    .skip-link:focus {
      top: 6px !important;
    }
    
    @media (prefers-reduced-motion: reduce) {
      .notification-content,
      .skip-link {
        transition: none !important;
      }
    }
  `
  document.head.appendChild(style)
})

// Make functions globally available
window.showSection = showSection
window.toggleMobileMenu = toggleMobileMenu
window.handleFormSubmit = handleFormSubmit

// Service Worker registration for PWA capabilities (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}

// Error handling
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error)
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason)
})
