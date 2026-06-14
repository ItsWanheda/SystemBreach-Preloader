document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progress-bar');
    const percentText = document.getElementById('percent-text');
    const hexCode = document.getElementById('hex-code');
    const typingText = document.getElementById('typing-text');
    const statusText = document.getElementById('status-text');
    const threatLevel = document.getElementById('threat-level');
    const skipContainer = document.getElementById('skip-container');
    const skipBtn = document.getElementById('skip-btn');
    const mainContent = document.getElementById('main-content');

    // Configuration
    const messages = [
        "INITIALIZING KERNEL...",
        "LOADING MODULES: [CRYPTO, NETWORK, EXPLOIT]",
        "BYPASSING FIREWALL...",
        "DECRYPTING DATA STREAMS...",
        "ESTABLISHING SECURE CONNECTION...",
        "ACCESS GRANTED."
    ];

    let progress = 0;
    let messageIndex = 0;
    let charIndex = 0;
    let isComplete = false;
    let skipTimeout;
    let autoFinishTimeout;

    // Helper: Generate random hex string
    const getRandomHex = () => {
        return '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(4, '0');
    };

    // Helper: Update Threat Level
    const updateThreatLevel = (percent) => {
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
    };

    // Helper: Typewriter effect
    const typeWriter = (text, element, speed = 50) => {
        return new Promise((resolve) => {
            element.textContent = "";
            charIndex = 0;
            
            const type = () => {
                if (charIndex < text.length) {
                    element.textContent += text.charAt(charIndex);
                    charIndex++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            };
            type();
        });
    };

    // Helper: Decode effect
    const decodeText = (element, finalText, duration = 500) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
        let iterations = 0;
        const interval = setInterval(() => {
            element.textContent = finalText
                .split("")
                .map((letter, index) => {
                    if (index < iterations) {
                        return finalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("");
            
            if (iterations >= finalText.length) {
                clearInterval(interval);
            }
            
            iterations += 1 / 3;
        }, 30);
    };

    // Main Loading Simulation
    const simulateLoading = async () => {
        // Initial Typing
        await typeWriter(messages[0], typingText, 50);
        
        // Show Skip Button after 3 seconds
        skipTimeout = setTimeout(() => {
            if (!isComplete && skipContainer) {
                skipContainer.classList.add('visible');
            }
        }, 3000);

        // NEW: 10-Second Hard Timeout
        autoFinishTimeout = setTimeout(() => {
            if (!isComplete) {
                console.log("Time limit reached. Forcing finish.");
                finishLoading();
            }
        }, 10000); // 10,000 milliseconds = 10 seconds

        // Loop until 100% or Timeout
        const loadInterval = setInterval(() => {
            if (isComplete) {
                clearInterval(loadInterval);
                return;
            }

            // Variable Increment
            let increment = Math.random() * 2;
            
            // Simulate "stalling"
            if (Math.random() > 0.9) {
                increment = 0; 
            } else if (Math.random() > 0.8) {
                increment = 5; 
            }

            progress += increment;

            if (progress >= 100) {
                progress = 100;
                clearInterval(loadInterval);
                finishLoading();
            }

            // Update UI
            const currentPercent = Math.floor(progress);
            progressBar.style.width = `${currentPercent}%`;
            percentText.textContent = `${currentPercent}%`;
            hexCode.textContent = getRandomHex();

            // Update Threat Level
            updateThreatLevel(currentPercent);

            // Update Status Text based on progress milestones
            if (currentPercent % 20 === 0 && messageIndex < messages.length - 1) {
                messageIndex++;
                statusText.style.opacity = '0.5';
                setTimeout(() => statusText.style.opacity = '1', 100);
                
                typingText.textContent = "";
                typeWriter(messages[messageIndex], typingText, 30);
            }

        }, 50); // Update every 50ms
    };

    const finishLoading = () => {
        isComplete = true;
        
        // Clear the auto-finish timeout if it hasn't fired yet
        clearTimeout(autoFinishTimeout);

        // Final decode effect on the main title
        const glitchTitle = document.querySelector('.glitch');
        decodeText(glitchTitle, "SYSTEM_READY", 800);

        // Fade out preloader
        setTimeout(() => {
            if (preloader) {
                preloader.style.opacity = '0';
                preloader.style.pointerEvents = 'none';
                
                // Show main content
                if (mainContent) {
                    mainContent.style.display = 'block';
                    document.body.style.overflow = 'auto';
                }

                // Remove from DOM after transition
                setTimeout(() => {
                    if (preloader.parentNode) {
                        preloader.parentNode.removeChild(preloader);
                    }
                }, 500);
            }
        }, 800);
    };

    // Skip Functionality
    const skipLoading = () => {
        if (!isComplete) {
            isComplete = true;
            clearTimeout(skipTimeout);
            clearTimeout(autoFinishTimeout);
            finishLoading();
        }
    };

    skipBtn.addEventListener('click', skipLoading);
    
    // Keyboard shortcut to skip
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            skipLoading();
        }
    });

    // Start the process
    simulateLoading();
});