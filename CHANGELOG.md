# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.0] - 2026-06-23

### 🎉 Major Update: Service Worker & Developer Callbacks

This release introduces offline support via Service Worker and a powerful callback system for developers.

---

### ✨ Added

#### Service Worker (`sw.js`)
- **Offline Caching** - Preloader assets cached for offline use
- **Cache Strategy** - Stale-while-revalidate for dynamic content
- **Background Sync** - Ready for analytics sync (future use)
- **Push Notifications** - Infrastructure ready (future use)
- **Cache Management** - Message-based cache clear and status APIs
- **Install Event** - Precaches all static assets on install
- **Activate Event** - Cleans up old caches automatically
- **Fetch Event** - Serves from cache, falls back to network

#### PWA Manifest (`manifest.json`)
- **Installable App** - Full PWA manifest for "Add to Home Screen"
- **Theme Colors** - Custom red (`#ff003c`) theme color
- **Background Color** - Matches preloader dark theme
- **Standalone Display** - Opens without browser chrome
- **SVG Favicon** - Generated inline favicon

#### JavaScript Class Architecture
- **SystemBreachPreloader Class** - Clean OOP structure
- **PreloaderCallbacks Class** - Event subscription system
- **Configurable Options** - Duration, intervals, delays all customizable
- **Global Instance** - `window.preloader` for easy access
- **Clean API** - `on()`, `getProgress()`, `complete()`, `reset()`

#### Callback System
- **onProgress** - Triggered on every progress update (every ~100ms)
  - Provides: `progress`, `rawProgress`, `elapsed`, `remaining`
- **onMilestone** - Triggered once per milestone (0%, 20%, 40%, 60%, 80%, 100%)
  - Provides: `milestone`, `message`, `index`
- **onComplete** - Triggered when loading finishes (natural completion)
  - Provides: `forced`, `duration`, `finalProgress`
- **onSkip** - Triggered when user skips preloader
  - Provides: `duration`, `progress`
- **onStart** - Triggered when preloader begins
  - Provides: `timestamp`
- **onError** - Triggered on errors (missing elements, SW failures)
  - Provides: `type`, `message`
- **Unsubscribe Functions** - All callbacks return cleanup functions

#### Public API
- **preloader.on(event, callback)** - Register event listeners
- **preloader.getProgress()** - Get current progress state
- **preloader.complete()** - Force completion programmatically
- **preloader.reset()** - Reset preloader to initial state
- **preloader.getSWStatus()** - Check service worker status

#### Error Handling
- **Missing Element Validation** - Checks all required DOM elements exist
- **Service Worker Fallback** - Gracefully degrades if SW unavailable
- **Callback Error Catcher** - Prevents one callback from breaking others
- **Network Fallback** - Returns offline fallback when cache unavailable

---

### 🔄 Changed

#### File Structure
- **Root Level Files** - `sw.js` and `manifest.json` at project root
- **Updated Paths** - main.js registration path changed to `../sw.js`
- **Index.html Updates** - Added manifest link in `<head>`

#### Architecture
- **IIFE Pattern** - Code wrapped in immediately invoked function
- **Strict Mode** - Added `'use strict'` for better error checking
- **State Management** - Centralized state in class properties
- **Timer Management** - Consolidated in `timers` object for easy cleanup

---

### 🐛 Fixed

- **Milestone Duplication** - Now uses `Set` to track triggered milestones
- **Progress Accuracy** - Time-based progress calculation instead of random
- **Timer Cleanup** - All timers properly cleared on finish/skip
- **Double-Trigger Prevention** - Added `isComplete` guards everywhere

---

## [1.3.0] - 2026-06-21

### 🎉 Major Update: Enhanced Responsiveness & Accessibility

This release brings comprehensive responsive improvements, accessibility enhancements, and performance optimizations.

---

### ✨ Added

#### CSS Enhancements
- **Fluid Typography** - `clamp()` based font scaling for all text elements (`--font-size-xs` through `--font-size-xxl`)
- **Dynamic Spacing System** - Responsive spacing using CSS custom properties with `clamp()` (`--space-xs` to `--space-xl`)
- **Dynamic Viewport Units** - Added `100dvh` support for better mobile browser compatibility
- **Backdrop Blur Effect** - Added glass-morphism effect with `backdrop-filter: blur(10px)`
- **GPU Acceleration Hints** - Added `will-change: transform` to animated elements for better performance
- **Progress Bar Shimmer** - Added animated shimmer effect to progress bar fill
- **Touch Interaction Feedback** - Added `:active` state with scale transformation on skip button
- **Focus States** - Enhanced `:focus-visible` styling for keyboard accessibility

#### JavaScript Enhancements
- **Responsive Typing Speed** - Dynamic typing speed based on screen size (faster on desktop, smoother on mobile)
- **Adaptive Update Interval** - Progress updates slower on very small screens (400px and below)
- **Touch Event Handler** - Proper `touchend` event with `preventDefault()` to avoid double-firing on mobile
- **Resize Event Handler** - Debounced resize handler for responsive adjustments
- **Tab Visibility Handling** - Basic support for pausing when tab is hidden
- **Enhanced Decode Animation** - Improved text decode effect with proper completion check
- **Visual Feedback on Skip** - Button scale animation on click
- **Data Attributes Support** - Custom messages via `data-messages` attribute on preloader element

#### Accessibility
- **Reduced Motion Support** - Full `@media (prefers-reduced-motion: reduce)` support
  - All animations disabled
  - Glitch effects hidden
  - Scanline and noise effects hidden
  - Cursor blink slowed to 2s interval
- **High Contrast Mode** - `@media (prefers-contrast: high)` support with adjusted color values and thicker borders
- **Print Styles** - Proper `@media print` rules to hide preloader and show main content
- **Keyboard Navigation** - Enhanced focus-visible states
- **Touch Target Size** - Minimum 44px touch targets for all interactive elements

#### Responsive Breakpoints
- **400px and below** - Extra small devices (stacked header, smaller title, full-width skip button)
- **600px and below** - Small devices (reduced padding, centered signature)
- **768px and up** - Medium devices (tablets with increased padding)
- **1200px and up** - Large devices (larger glitch title)
- **Landscape Mode** - Special optimizations for landscape orientation on small screens

### 🔄 Changed

#### CSS Improvements
- **Scanline Effect** - Optimized from gradient to `repeating-linear-gradient` for better performance
- **Noise Animation** - Reduced to 2 steps and uses absolute positioning for smoother animation
- **Background Grid** - Dynamic size using `clamp()` based on viewport
- **Loader Content** - Added `max-height` consideration and enhanced box-shadow
- **Threat Level** - Added `white-space: nowrap` to prevent text wrapping
- **Progress Bar** - Dynamic height using `clamp()` with shimmer effect
- **Cursor** - Dynamic width using `clamp()`
- **Progress Stats** - Adjusted margin using spacing variable
- **Signature** - Dynamic positioning using `clamp()`

#### JavaScript Improvements
- **Typing Speed Variable** - Now adapts based on screen size
- **Message Index Logic** - Improved milestone calculation using `Math.min()` and `Math.floor()`
- **Progress Increment** - Maintained variable increment with stalling simulation
- **Threat Level Update** - Added check to prevent unnecessary DOM updates
- **Status Text Update** - Added transform animation for visual feedback
- **Decode Effect** - Uses `Math.min()` for safer iteration handling
- **Skip Handler** - Prevents double-triggers with `isComplete` check
- **Interval Cleanup** - Uses `setTimeout` instead of `setInterval` for better control

### 🐛 Fixed

#### CSS
- **Text Rendering** - Added `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`
- **Text Size Adjustment** - Added `-webkit-text-size-adjust: 100%` for iOS
- **Glitch Effect** - Enhanced shadow effects with additional layers for better visual
- **Box Sizing** - Explicit `box-sizing: border-box` on all elements
- **Body Overflow** - Now uses `min-height: 100vh` and `min-height: 100dvh` together

#### JavaScript
- **Timeout Cleanup** - Added `clearTimeout(loadInterval)` for proper cleanup
- **Skip Button** - Added null checks before accessing `skipBtn.style`
- **Finish Loading Guard** - Added check to prevent multiple execution of `finishLoading()`
- **Decode Effect Cleanup** - Properly clears interval and sets final text when complete or skipped

### 📝 Documentation
- Added comprehensive changelog documenting all updates

---

## [1.0.0] - 2026-06-20

### 🎉 Initial Release

- Cyberpunk-style preloader with CRT scanlines and noise effects
- Glitch typography with chromatic aberration
- Typewriter effect for terminal-style messages
- Progress bar with variable loading simulation
- Threat level system (LOW → MODERATE → HIGH → CRITICAL)
- Skip button with keyboard shortcuts (Enter/Escape)
- Auto timeout after 10 seconds
- Basic responsive design
- Basic mobile support

---

## [Unreleased] - Future Plans

- [ ] Audio effects toggle (keyboard typing sounds)
- [ ] Multiple preloader themes
- [ ] ~~Custom message customization via data attributes~~ ✅ **Completed in v1.3.0**
- [ ] WebGL-based glitch effects for enhanced visuals
- [ ] ~~Service worker for offline preloader caching~~ ✅ **Completed in v1.4.0**
- [ ] ~~Progress milestone callbacks for developers~~ ✅ **Completed in v1.4.0**
- [ ] Loading stages configuration
- [ ] Svelte/React/Vue component versions
- [ ] Accessibility audit (WCAG 2.1 AA compliance)