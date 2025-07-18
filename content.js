// DistraX Content Script
(function() {
    'use strict';

    // Motivation quotes
    const motivationQuotes = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "Your limitation—it's only your imagination.",
        "Push yourself, because no one else is going to do it for you.",
        "Great things never come from comfort zones.",
        "Dream it. Wish it. Do it.",
        "Success doesn't just find you. You have to go out and get it.",
        "The harder you work for something, the greater you'll feel when you achieve it.",
        "Don't stop when you're tired. Stop when you're done.",
        "Wake up with determination. Go to bed with satisfaction."
    ];

    // Get site name from URL
    function getSiteName() {
        const hostname = window.location.hostname.toLowerCase();
        if (hostname.includes('youtube')) return 'YouTube';
        if (hostname.includes('instagram')) return 'Instagram';
        if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter';
        if (hostname.includes('twitch')) return 'Twitch';
        if (hostname.includes('netflix')) return 'Netflix';
        if (hostname.includes('primevideo')) return 'Prime Video';
        if (hostname.includes('jiocinema')) return 'JioCinema';
        return 'this site';
    }

    // Create blur overlay
    function createBlurOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'distrax-blur-overlay';
        overlay.innerHTML = `
            <div class="distrax-backdrop"></div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    // Create modal popup
    function createModal() {
        const siteName = getSiteName();
        const modal = document.createElement('div');
        modal.id = 'distrax-modal';
        modal.innerHTML = `
            <div class="distrax-modal-content">
                <div class="distrax-modal-header">
                    <div class="distrax-logo">
                        <span class="distrax-icon">🎯</span>
                        <span class="distrax-title">DistraX</span>
                    </div>
                </div>
                <div class="distrax-modal-body">
                    <div class="distrax-question">
                        <h2>Is it worth it to watch <span class="distrax-site-name">${siteName}</span> right now?</h2>
                        <p>Take a moment to think about your goals and priorities.</p>
                    </div>
                    <div class="distrax-buttons">
                        <button class="distrax-btn distrax-btn-yes" id="distrax-yes">
                            <span>Yes, I'm sure</span>
                        </button>
                        <button class="distrax-btn distrax-btn-no" id="distrax-no">
                            <span>No, I should be productive</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    // Create motivation modal
    function createMotivationModal() {
        const quote = motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
        const modal = document.createElement('div');
        modal.id = 'distrax-motivation-modal';
        modal.innerHTML = `
            <div class="distrax-modal-content distrax-motivation-content">
                <div class="distrax-modal-header">
                    <div class="distrax-logo">
                        <span class="distrax-icon">💪</span>
                        <span class="distrax-title">Stay Strong!</span>
                    </div>
                </div>
                <div class="distrax-modal-body">
                    <div class="distrax-motivation-text">
                        <h2>Great choice!</h2>
                        <div class="distrax-quote">
                            <p>"${quote}"</p>
                        </div>
                        <p class="distrax-productivity-message">
                            Now go and be productive! Your future self will thank you.
                        </p>
                    </div>
                    <div class="distrax-buttons">
                        <button class="distrax-btn distrax-btn-close" id="distrax-close">
                            <span>Let's be productive! 🚀</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    // Initialize DistraX
    function initDistraX() {
        // Check if already initialized
        if (document.getElementById('distrax-blur-overlay')) return;

        // Create blur overlay
        const overlay = createBlurOverlay();
        
        // Create modal
        const modal = createModal();

        // Add event listeners
        document.getElementById('distrax-yes').addEventListener('click', function() {
            // Remove blur and modal
            overlay.remove();
            modal.remove();
        });

        document.getElementById('distrax-no').addEventListener('click', function() {
            // Remove current modal
            modal.remove();
            
            // Show motivation modal
            const motivationModal = createMotivationModal();
            
            // Add close button listener
            document.getElementById('distrax-close').addEventListener('click', function() {
                motivationModal.remove();
                overlay.remove();
                // Redirect to a productive site
                window.location.href = 'https://www.google.com';
            });
        });
    }

    // Run when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDistraX);
    } else {
        initDistraX();
    }

    // Also run on navigation changes (for SPAs)
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            setTimeout(initDistraX, 1000);
        }
    }, 1000);
})();