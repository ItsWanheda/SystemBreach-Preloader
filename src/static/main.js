/**
 * System Breach Preloader
 */

(function () {
    'use strict';

    const CONFIG = {
        duration: 10000,
        updateInterval: 100,
        skipDelay: 3000,
        decodeDuration: 800,
        fadeOutDuration: 500,
        cursorStyle: 'block' // Options: block, underscore, pipe, bar, hollow, glow, scanline
    };

    const MESSAGES = [
        { text: "INITIALIZING KERNEL...", percent: 0 },
        { text: "LOADING MODULES: [CRYPTO, NETWORK, EXPLOIT]", percent: 20 },
        { text: "BYPASSING FIREWALL...", percent: 40 },
        { text: "DECRYPTING DATA STREAMS...", percent: 60 },
        { text: "ESTABLISHING SECURE CONNECTION...", percent: 80 },
        { text: "ACCESS GRANTED.", percent: 100 }
    ];

    class PreloaderCallbacks {
        constructor() {
            this.callbacks = {
                onProgress: [],
                onMilestone: [],
                onComplete: [],
                onSkip: [],
                onStart: [],
                onError: []
            };
            this.triggeredMilestones = new Set();
        }

        on(event, callback) {
            if (!this.callbacks[event]) return () => { };
            this.callbacks[event].push(callback);
            return () => {
                const index = this.callbacks[event].indexOf(callback);
                if (index > -1) this.callbacks[event].splice(index, 1);
            };
        }

        trigger(event, data) {
            if (!this.callbacks[event]) return;
            this.callbacks[event].forEach(callback => {
                try { callback(data); }
                catch (error) { console.error(`Error in ${event} callback:`, error); }
            });
        }

        triggerMilestone(milestone, data) {
            if (this.triggeredMilestones.has(milestone)) return;
            this.triggeredMilestones.add(milestone);
            this.trigger('onMilestone', { milestone, ...data });
        }

        clearAll() {
            Object.keys(this.callbacks).forEach(key => {
                this.callbacks[key] = [];
            });
            this.triggeredMilestones.clear();
        }
    }

    class SystemBreachPreloader {
        constructor(options = {}) {
            this.config = { ...CONFIG, ...options };
            this.callbacks = new PreloaderCallbacks();
            this.progress = 0;
            this.currentMessageIndex = 0;
            this.isComplete = false;
            this.isSkipped = false;
            this.startTime = null;
            this.timers = {};
            this.boundHandlers = {};
            this.eventCleanups = [];
            this.swRegistration = null;
        }

        init() {
            this.elements = this.getElements();

            if (!this.validateElements()) return this;

            // Set cursor style
            this.setCursorStyle(this.config.cursorStyle);

            this.registerServiceWorker();
            this.bindEvents();
            this.callbacks.trigger('onStart', { timestamp: Date.now() });
            this.startLoading();

            return this;
        }

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

        validateElements() {
            const required = ['preloader', 'progressBar', 'percentText', 'hexCode',
                'typingText', 'statusText', 'threatLevel', 'skipContainer',
                'skipBtn', 'mainContent', 'glitchTitle'];

            const missing = required.filter(el => !this.elements[el]);
            if (missing.length > 0) {
                console.error('[Preloader] Missing elements:', missing);
                return false;
            }
            return true;
        }

        // ═══════════════════════════════════════════════════════════════
        // CUSTOM CURSOR
        // ═══════════════════════════════════════════════════════════════

        setCursorStyle(style) {
            // Find cursor element - it's INSIDE typing-text
            const cursor = document.querySelector('.cursor');
            if (!cursor) {
                console.warn('[Preloader] Cursor element not found');
                return;
            }

            // Remove all existing style classes
            cursor.className = 'cursor';

            // Add new style class
            cursor.classList.add(`cursor--${style}`);

            // Also set data attribute for CSS
            cursor.setAttribute('data-style', style);

            console.log(`[Preloader] Cursor style set to: ${style}`);
        }

        setCursorColor(color) {
            const cursor = document.querySelector('.cursor');
            if (cursor) {
                cursor.style.backgroundColor = color;
            }
        }

        registerServiceWorker() {
            if (!('serviceWorker' in navigator)) return;

            navigator.serviceWorker.register('../sw.js', { scope: './' })
                .then(reg => { this.swRegistration = reg; })
                .catch(err => {
                    console.warn('[Preloader] SW registration failed:', err);
                });
        }

        bindEvents() {
            const { skipBtn } = this.elements;

            this.boundHandlers = {
                skipClick: (e) => this.skip(e),
                keydown: (e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                        e.preventDefault();
                        this.skip(e);
                    }
                }
            };

            skipBtn.addEventListener('click', this.boundHandlers.skipClick);
            this.eventCleanups.push(() => skipBtn.removeEventListener('click', this.boundHandlers.skipClick));

            document.addEventListener('keydown', this.boundHandlers.keydown);
            this.eventCleanups.push(() => document.removeEventListener('keydown', this.boundHandlers.keydown));
        }

        startLoading() {
            this.startTime = Date.now();

            this.timers.skip = setTimeout(() => {
                if (!this.isComplete) {
                    this.elements.skipContainer.classList.add('visible');
                }
            }, this.config.skipDelay);

            this.timers.timeout = setTimeout(() => {
                if (!this.isComplete) {
                    this.setProgress(100);
                    this.finish(true);
                }
            }, this.config.duration);

            this.updateProgress();
        }

        updateProgress() {
            if (this.isComplete) return;

            const elapsed = Date.now() - this.startTime;
            const targetProgress = Math.min((elapsed / this.config.duration) * 100, 100);

            if (targetProgress > this.progress) {
                this.progress = Math.min(this.progress + 1, targetProgress);
            }

            const currentPercent = Math.floor(this.progress);

            this.updateUI(currentPercent);
            this.checkMilestones(currentPercent);

            this.callbacks.trigger('onProgress', {
                progress: currentPercent,
                rawProgress: this.progress
            });

            if (this.progress >= 100) {
                this.finish();
            } else {
                this.timers.main = setTimeout(() => this.updateProgress(), this.config.updateInterval);
            }
        }

        updateUI(percent) {
            const { progressBar, percentText, hexCode } = this.elements;

            progressBar.style.width = `${percent}%`;
            percentText.textContent = `${percent}%`;
            hexCode.textContent = this.getRandomHex();
            this.updateThreatLevel(percent);
        }

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

        updateMessage(message) {
            const { typingText, statusText } = this.elements;
            typingText.textContent = message.text;
            const statusName = message.text.split(' ').replace(/\.$/, '');
            statusText.textContent = statusName;
        }

        updateThreatLevel(percent) {
            const { threatLevel } = this.elements;

            if (percent < 30) {
                threatLevel.textContent = "LOW";
                threatLevel.className = "threat-value";
            } else if (percent < 70) {
                threatLevel.textContent = "MODERATE";
                threatLevel.className = "threat-value";
            } else if (percent < 100) {
                threatLevel.textContent = "HIGH";
                threatLevel.className = "threat-value";
            } else {
                threatLevel.textContent = "CRITICAL";
                threatLevel.className = "threat-value critical";
            }
        }

        setProgress(percent) {
            this.progress = percent;
            this.updateUI(Math.floor(percent));
            this.checkMilestones(Math.floor(percent));
        }

        finish(forced = false) {
            if (this.isComplete) return;
            this.isComplete = true;

            this.cleanupTimers();

            const { statusText, threatLevel, typingText } = this.elements;
            statusText.textContent = "READY";
            typingText.textContent = "ACCESS GRANTED.";
            threatLevel.textContent = "CRITICAL";
            threatLevel.className = "threat-value critical";

            this.decodeTitle(() => {
                this.fadeOut(() => {
                    this.showContent();
                    this.callbacks.trigger('onComplete', { forced, finalProgress: 100 });
                    this.destroy();
                });
            });
        }

        skip(event) {
            if (event) event.preventDefault();
            if (this.isComplete) return;
            this.isSkipped = true;
            this.setProgress(100);
            this.callbacks.trigger('onSkip', { progress: this.progress });
            this.finish(false);
        }

        decodeTitle(callback) {
            const { glitchTitle } = this.elements;
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
            const finalText = "SYSTEM_READY";
            let iterations = 0;
            const totalIterations = finalText.length * 3;
            let interval;

            interval = setInterval(() => {
                if (iterations >= totalIterations) {
                    clearInterval(interval);
                    glitchTitle.textContent = finalText;
                    if (callback) callback();
                    return;
                }

                glitchTitle.textContent = finalText
                    .split("")
                    .map((letter, index) => {
                        if (index < iterations / 3) return finalText[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("");

                iterations += 1;
            }, 30);
        }

        fadeOut(callback) {
            const { preloader } = this.elements;
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';
            document.body.style.overflow = 'auto';

            setTimeout(() => {
                if (callback) callback();
            }, this.config.fadeOutDuration);
        }

        showContent() {
            const { preloader, mainContent } = this.elements;
            mainContent.style.display = 'block';
            setTimeout(() => {
                if (preloader.parentNode) preloader.remove();
            }, 100);
        }

        cleanupTimers() {
            Object.values(this.timers).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
            this.timers = {};
        }

        cleanupEventListeners() {
            this.eventCleanups.forEach(cleanup => {
                try { cleanup(); } catch (e) { }
            });
            this.eventCleanups = [];
        }

        destroy() {
            this.cleanupTimers();
            this.cleanupEventListeners();
            this.callbacks.clearAll();
            if (window.preloader === this) {
                delete window.preloader;
            }
        }

        getRandomHex() {
            return '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
        }

        // PUBLIC API
        on(event, callback) {
            return this.callbacks.on(event, callback);
        }

        getProgress() {
            return {
                current: Math.floor(this.progress),
                raw: this.progress,
                isComplete: this.isComplete,
                isSkipped: this.isSkipped
            };
        }

        complete() {
            this.setProgress(100);
            this.finish(false);
        }

        setCursor(style) {
            this.setCursorStyle(style);
        }

        reset() {
            this.cleanupTimers();
            this.progress = 0;
            this.currentMessageIndex = 0;
            this.isComplete = false;
            this.isSkipped = false;
            this.startTime = null;
            this.callbacks.triggeredMilestones.clear();
        }
    }

    // Initialize
    if (window.preloader) {
        try { window.preloader.destroy(); } catch (e) { }
    }
    window.preloader = new SystemBreachPreloader().init();

})(); 
 