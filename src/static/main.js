/**
 * System Breach Preloader
 * Enhanced with progress callbacks and service worker support
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════

    const CONFIG = {
        duration: 10000,           // Total loading time in ms
        updateInterval: 100,       // Progress update interval in ms
        skipDelay: 3000,          // Delay before skip button appears
        decodeDuration: 800,       // Title decode animation duration
        fadeOutDuration: 500       // Preloader fade out duration
    };

    // Messages with progress milestones
    const MESSAGES = [
        { text: "INITIALIZING KERNEL...", percent: 0 },
        { text: "LOADING MODULES: [CRYPTO, NETWORK, EXPLOIT]", percent: 20 },
        { text: "BYPASSING FIREWALL...", percent: 40 },
        { text: "DECRYPTING DATA STREAMS...", percent: 60 },
        { text: "ESTABLISHING SECURE CONNECTION...", percent: 80 },
        { text: "ACCESS GRANTED.", percent: 100 }
    ];

    // ═══════════════════════════════════════════════════════════════════
    // CALLBACK SYSTEM
    // ═══════════════════════════════════════════════════════════════════

    class PreloaderCallbacks {
        constructor() {
            this.callbacks = {
                onProgress: [],      // Called on every progress update
                onMilestone: [],     // Called when reaching specific milestones
                onComplete: [],      // Called when loading completes
                onSkip: [],          // Called when user skips
                onStart: [],         // Called when loading starts
                onError: []          // Called on errors
            };

            this.triggeredMilestones = new Set();
        }

        /**
         * Register a callback
         * @param {string} event - Event name
         * @param {function} callback - Callback function
         * @returns {function} Unsubscribe function
         */
        on(event, callback) {
            if (!this.callbacks[event]) {
                console.error(`Unknown event: ${event}`);
                return () => { };
            }

            this.callbacks[event].push(callback);

            // Return unsubscribe function
            return () => {
                const index = this.callbacks[event].indexOf(callback);
                if (index > -1) {
                    this.callbacks[event].splice(index, 1);
                }
            };
        }

        /**
         * Trigger all callbacks for an event
         * @param {string} event - Event name
         * @param {*} data - Data to pass to callbacks
         */
        trigger(event, data) {
            if (!this.callbacks[event]) return;

            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }

        /**
         * Trigger milestone callback (only once per milestone)
         * @param {number} milestone - Milestone percent
         * @param {object} data - Additional data
         */
        triggerMilestone(milestone, data) {
            if (this.triggeredMilestones.has(milestone)) return;

            this.triggeredMilestones.add(milestone);
            this.trigger('onMilestone', { milestone, ...data });
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // MAIN LOADER CLASS
    // ═══════════════════════════════════════════════════════════════════

    class SystemBreachPreloader {
        constructor(options = {}) {
            // Merge options with defaults
            this.config = { ...CONFIG, ...options };

            // Callbacks instance
            this.callbacks = new PreloaderCallbacks();

            // State
            this.progress = 0;
            this.currentMessageIndex = 0;
            this.isComplete = false;
            this.isSkipped = false;
            this.startTime = null;
            this.timers = {
                main: null,
                skip: null,
                timeout: null
            };

            // Cache service worker registration promise
            this.swRegistration = null;
        }

        // ═══════════════════════════════════════════════════════════════
        // INITIALIZATION
        // ═══════════════════════════════════════════════════════════════

        /**
         * Initialize the preloader
         */
        init() {
            // Get DOM elements
            this.elements = this.getElements();

            // Validate elements
            if (!this.validateElements()) {
                return this;
            }

            // Register service worker
            this.registerServiceWorker();

            // Bind event listeners
            this.bindEvents();

            // Trigger start callback
            this.callbacks.trigger('onStart', { timestamp: Date.now() });

            // Start loading
            this.startLoading();

            return this;
        }

        /**
         * Get all required DOM elements
         */
        getElements() {
            return {
                preloader: document.getElementById('preloader'),
                progressBar: document.getElementById('progress-bar'),
                percentText: document.getElementById('percent-text'),
                hexCode: document.getElementById('hex-code'),
                typingText: document.getElementById('typing-text'),
                statusText: document.getElementById('status-text'),
                threatLevel: document.getElementById('threat-level'),
                skipContainer: document.getElementById('skip-container'),
                skipBtn: document.getElementById('skip-btn'),
                mainContent: document.getElementById('main-content'),
                glitchTitle: document.getElementById('glitch-title')
            };
        }

        /**
         * Validate all required elements exist
         */
        validateElements() {
            const required = [
                'preloader', 'progressBar', 'percentText', 'hexCode',
                'typingText', 'statusText', 'threatLevel', 'skipContainer',
                'skipBtn', 'mainContent', 'glitchTitle'
            ];

            const missing = required.filter(el => !this.elements[el]);

            if (missing.length > 0) {
                const error = `Missing elements: ${missing.join(', ')}`;
                console.error('[Preloader]', error);
                this.callbacks.trigger('onError', { type: 'missing_elements', message: error });
                return false;
            }

            return true;
        }

        /**
         * Register service worker for offline support
         */
        async registerServiceWorker() {
            if (!('serviceWorker' in navigator)) {
                console.log('[Preloader] Service Worker not supported');
                return;
            }

            try {
                this.swRegistration = await navigator.serviceWorker.register('../sw.js', {
                    scope: './'
                });

                console.log('[Preloader] Service Worker registered');

                this.swRegistration.addEventListener('updatefound', () => {
                    console.log('[Preloader] New service worker available');
                });

            } catch (error) {
                console.warn('[Preloader] Service Worker registration failed:', error);
                this.callbacks.trigger('onError', {
                    type: 'sw_registration',
                    message: error.message
                });
            }
        }

        /**
         * Bind event listeners
         */
        bindEvents() {
            const { skipBtn } = this.elements;

            // Click handler
            skipBtn.addEventListener('click', (e) => this.skip(e));

            // Keyboard handler
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                    this.skip(e);
                }
            });

            // Visibility change handler
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && !this.isComplete) {
                    console.log('[Preloader] Tab hidden, preloader paused');
                }
            });

            // Before unload handler
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // LOADING LOGIC
        // ═══════════════════════════════════════════════════════════════

        /**
         * Start the loading process
         */
        startLoading() {
            this.startTime = Date.now();

            // Show skip button after delay
            this.timers.skip = setTimeout(() => {
                if (!this.isComplete) {
                    this.elements.skipContainer.classList.add('visible');
                }
            }, this.config.skipDelay);

            // Force finish after timeout
            this.timers.timeout = setTimeout(() => {
                if (!this.isComplete) {
                    this.setProgress(100);
                    this.finish(true);
                }
            }, this.config.duration);

            // Start progress updates
            this.updateProgress();
        }

        /**
         * Main progress update loop
         */
        updateProgress() {
            if (this.isComplete) return;

            // Calculate elapsed time for smooth progress
            const elapsed = Date.now() - this.startTime;
            const targetProgress = Math.min((elapsed / this.config.duration) * 100, 100);

            // Smooth progress increment
            if (targetProgress > this.progress) {
                this.progress = Math.min(this.progress + 1, targetProgress);
            }

            const currentPercent = Math.floor(this.progress);

            // Update UI
            this.updateUI(currentPercent);

            // Check milestones
            this.checkMilestones(currentPercent);

            // Trigger progress callback
            this.callbacks.trigger('onProgress', {
                progress: currentPercent,
                rawProgress: this.progress,
                elapsed,
                remaining: this.config.duration - elapsed
            });

            // Continue or finish
            if (this.progress >= 100) {
                this.finish();
            } else {
                this.timers.main = setTimeout(() => this.updateProgress(), this.config.updateInterval);
            }
        }

        /**
         * Update UI elements
         */
        updateUI(percent) {
            const { progressBar, percentText, hexCode, threatLevel } = this.elements;

            // Update progress bar
            progressBar.style.width = `${percent}%`;

            // Update percentage text
            percentText.textContent = `${percent}%`;

            // Update hex code
            hexCode.textContent = this.getRandomHex();

            // Update threat level
            this.updateThreatLevel(percent);
        }

        /**
         * Check and trigger milestones
         */
        checkMilestones(percent) {
            for (const message of MESSAGES) {
                if (percent >= message.percent) {
                    const messageIndex = MESSAGES.indexOf(message);

                    if (messageIndex > this.currentMessageIndex) {
                        this.currentMessageIndex = messageIndex;
                        this.updateMessage(message);
                        this.callbacks.triggerMilestone(message.percent, {
                            message: message.text,
                            index: messageIndex
                        });
                    }
                }
            }
        }

        /**
         * Update message text
         */
        updateMessage(message) {
            const { typingText, statusText } = this.elements;

            // Update typing text
            typingText.textContent = message.text;

            // Update status (first word)
            const statusName = message.text.split(' ').replace(/\.$/, '');
            statusText.textContent = statusName;
        }

        /**
         * Update threat level display
         */
        updateThreatLevel(percent) {
            const { threatLevel } = this.elements;

            let level, className;

            if (percent < 30) {
                level = "LOW";
                className = "threat-value";
            } else if (percent < 70) {
                level = "MODERATE";
                className = "threat-value";
            } else if (percent < 100) {
                level = "HIGH";
                className = "threat-value";
            } else {
                level = "CRITICAL";
                className = "threat-value critical";
            }

            threatLevel.textContent = level;
            threatLevel.className = className;
        }

        /**
         * Set progress directly
         */
        setProgress(percent) {
            this.progress = percent;
            this.updateUI(Math.floor(percent));
            this.checkMilestones(Math.floor(percent));
        }

        // ═══════════════════════════════════════════════════════════════
        // FINISHING
        // ═══════════════════════════════════════════════════════════════

        /**
         * Finish loading
         */
        finish(forced = false) {
            if (this.isComplete) return;
            this.isComplete = true;

            // Clear all timers
            this.cleanup();

            // Update final state
            const { statusText, threatLevel, typingText } = this.elements;
            statusText.textContent = "READY";
            typingText.textContent = "ACCESS GRANTED.";
            threatLevel.textContent = "CRITICAL";
            threatLevel.className = "threat-value critical";

            // Decode title animation
            this.decodeTitle(() => {
                // Fade out preloader
                this.fadeOut(() => {
                    // Show main content
                    this.showContent();

                    // Trigger callbacks
                    this.callbacks.trigger('onComplete', {
                        forced,
                        duration: Date.now() - this.startTime,
                        finalProgress: 100
                    });
                });
            });
        }

        /**
         * Skip loading
         */
        skip(event) {
            if (event) event.preventDefault();
            if (this.isComplete) return;

            this.isSkipped = true;
            this.setProgress(100);

            // Trigger skip callback
            this.callbacks.trigger('onSkip', {
                duration: Date.now() - this.startTime,
                progress: this.progress
            });

            this.finish(false);
        }

        /**
         * Decode title animation
         */
        decodeTitle(callback) {
            const { glitchTitle } = this.elements;
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
            const finalText = "SYSTEM_READY";
            let iterations = 0;
            const totalIterations = finalText.length * 3;

            const interval = setInterval(() => {
                if (iterations >= totalIterations) {
                    clearInterval(interval);
                    glitchTitle.textContent = finalText;
                    if (callback) callback();
                    return;
                }

                glitchTitle.textContent = finalText
                    .split("")
                    .map((letter, index) => {
                        if (index < iterations / 3) {
                            return finalText[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("");

                iterations += 1;
            }, 30);
        }

        /**
         * Fade out preloader
         */
        fadeOut(callback) {
            const { preloader } = this.elements;

            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';
            document.body.style.overflow = 'auto';

            setTimeout(() => {
                if (callback) callback();
            }, this.config.fadeOutDuration);
        }

        /**
         * Show main content
         */
        showContent() {
            const { preloader, mainContent } = this.elements;

            mainContent.style.display = 'block';
            mainContent.style.animation = 'fadeIn 0.5s ease-out';

            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.remove();
                }
            }, 100);
        }

        // ═══════════════════════════════════════════════════════════════
        // UTILITIES
        // ═══════════════════════════════════════════════════════════════

        /**
         * Generate random hex code
         */
        getRandomHex() {
            return '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
        }

        /**
         * Clean up timers
         */
        cleanup() {
            Object.values(this.timers).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // PUBLIC API
        // ═══════════════════════════════════════════════════════════════

        /**
         * Register a callback
         */
        on(event, callback) {
            return this.callbacks.on(event, callback);
        }

        /**
         * Get current progress
         */
        getProgress() {
            return {
                current: Math.floor(this.progress),
                raw: this.progress,
                isComplete: this.isComplete,
                isSkipped: this.isSkipped,
                elapsed: this.startTime ? Date.now() - this.startTime : 0
            };
        }

        /**
         * Force completion
         */
        complete() {
            this.setProgress(100);
            this.finish(false);
        }

        /**
         * Reset preloader
         */
        reset() {
            this.cleanup();
            this.progress = 0;
            this.currentMessageIndex = 0;
            this.isComplete = false;
            this.isSkipped = false;
            this.startTime = null;
            this.callbacks.triggeredMilestones.clear();
        }

        /**
         * Get service worker status
         */
        async getSWStatus() {
            if (!this.swRegistration) return { registered: false };

            try {
                const status = await navigator.serviceWorker.controller?.ready ||
                    await navigator.serviceWorker.ready;
                return {
                    registered: true,
                    ready: !!status,
                    controller: !!navigator.serviceWorker.controller
                };
            } catch (error) {
                return { registered: true, error: error.message };
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // AUTO-INITIALIZE
    // ═══════════════════════════════════════════════════════════════════

    // Create global preloader instance
    window.preloader = new SystemBreachPreloader().init();

})();