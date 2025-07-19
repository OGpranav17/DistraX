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

    // Gamification System
    const achievements = [
        { id: 'first_no', name: 'First Step', description: 'Said NO for the first time!', icon: '🚀', unlocked: false },
        { id: 'streak_3', name: 'On Fire', description: 'Made 3 productive choices in a row!', icon: '🔥', unlocked: false },
        { id: 'streak_7', name: 'Consistency King', description: 'Made 7 productive choices in a row!', icon: '👑', unlocked: false },
        { id: 'streak_21', name: 'Habit Master', description: 'Made 21 productive choices in a row!', icon: '🏆', unlocked: false },
        { id: 'level_5', name: 'Rising Star', description: 'Reached Level 5!', icon: '⭐', unlocked: false },
        { id: 'level_10', name: 'Productivity Guru', description: 'Reached Level 10!', icon: '🌟', unlocked: false },
        { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Stayed productive on weekends!', icon: '⚔️', unlocked: false },
        { id: 'early_bird', name: 'Early Bird', description: 'Made productive choices before 9 AM!', icon: '🐦', unlocked: false }
    ];

    // Game State Management
    function getGameState() {
        const defaultState = {
            level: 1,
            xp: 0,
            streak: 0,
            totalProductiveChoices: 0,
            totalVisits: 0,
            achievements: achievements.map(a => ({...a})),
            lastVisit: null
        };
        
        const saved = localStorage.getItem('distrax_game_state');
        return saved ? {...defaultState, ...JSON.parse(saved)} : defaultState;
    }

    function saveGameState(state) {
        localStorage.setItem('distrax_game_state', JSON.stringify(state));
    }

    function calculateLevel(xp) {
        return Math.floor(xp / 100) + 1;
    }

    function getXPForNextLevel(level) {
        return level * 100;
    }

    function updateGameState(wasProductive) {
        const state = getGameState();
        const today = new Date().toDateString();
        
        state.totalVisits++;
        
        if (wasProductive) {
            state.totalProductiveChoices++;
            state.xp += 20;
            
            // Check if streak continues (same day or consecutive days)
            if (state.lastVisit === today) {
                // Same day, don't break streak
            } else {
                const lastDate = new Date(state.lastVisit);
                const currentDate = new Date(today);
                const dayDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
                
                if (dayDiff === 1) {
                    state.streak++;
                } else if (dayDiff > 1) {
                    state.streak = 1;
                } else {
                    state.streak++;
                }
            }
        } else {
            state.xp += 5; // Small XP for visiting, even if not productive
            state.streak = 0; // Break streak
        }
        
        state.lastVisit = today;
        
        // Update level
        const newLevel = calculateLevel(state.xp);
        const leveledUp = newLevel > state.level;
        state.level = newLevel;
        
        // Check achievements
        const newAchievements = checkAchievements(state);
        
        saveGameState(state);
        
        return { state, leveledUp, newAchievements };
    }

    function checkAchievements(state) {
        const newAchievements = [];
        const hour = new Date().getHours();
        const isWeekend = [0, 6].includes(new Date().getDay());
        
        state.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            let shouldUnlock = false;
            
            switch (achievement.id) {
                case 'first_no':
                    shouldUnlock = state.totalProductiveChoices >= 1;
                    break;
                case 'streak_3':
                    shouldUnlock = state.streak >= 3;
                    break;
                case 'streak_7':
                    shouldUnlock = state.streak >= 7;
                    break;
                case 'streak_21':
                    shouldUnlock = state.streak >= 21;
                    break;
                case 'level_5':
                    shouldUnlock = state.level >= 5;
                    break;
                case 'level_10':
                    shouldUnlock = state.level >= 10;
                    break;
                case 'weekend_warrior':
                    shouldUnlock = isWeekend && state.totalProductiveChoices >= 5;
                    break;
                case 'early_bird':
                    shouldUnlock = hour < 9 && state.totalProductiveChoices >= 3;
                    break;
            }
            
            if (shouldUnlock) {
                achievement.unlocked = true;
                newAchievements.push(achievement);
            }
        });
        
        return newAchievements;
    }

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
        const gameState = getGameState();
        const xpForNext = getXPForNextLevel(gameState.level);
        const progressPercent = ((gameState.xp % 100) / 100) * 100;
        
        const modal = document.createElement('div');
        modal.id = 'distrax-modal';
        modal.innerHTML = `
            <div class="distrax-modal-content">
                <div class="distrax-modal-header">
                    <div class="distrax-logo">
                        <span class="distrax-icon">🎯</span>
                        <span class="distrax-title">DistraX</span>
                    </div>
                    <div class="distrax-stats">
                        <div class="distrax-level">
                            <span class="level-badge">Level ${gameState.level}</span>
                            <span class="xp-text">${gameState.xp} XP</span>
                        </div>
                        <div class="distrax-progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="distrax-streak">
                            <span class="streak-fire">🔥</span>
                            <span class="streak-count">${gameState.streak} day streak</span>
                        </div>
                    </div>
                </div>
                <div class="distrax-modal-body">
                    <div class="distrax-question">
                        <h2>Is it worth it to watch <span class="distrax-site-name">${siteName}</span> right now?</h2>
                        <p>Think about your goals. Your future self is watching! 👀</p>
                    </div>
                    <div class="distrax-buttons">
                        <button class="distrax-btn distrax-btn-yes" id="distrax-yes">
                            <span>Yes, I'm sure</span>
                            <small>+5 XP</small>
                        </button>
                        <button class="distrax-btn distrax-btn-no" id="distrax-no">
                            <span>No, I should be productive</span>
                            <small>+20 XP 🚀</small>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    // Create motivation modal
    function createMotivationModal(gameUpdate) {
        const quote = motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
        const modal = document.createElement('div');
        modal.id = 'distrax-motivation-modal';
        
        let achievementHTML = '';
        if (gameUpdate.newAchievements.length > 0) {
            achievementHTML = `
                <div class="distrax-achievements">
                    <h3>🏆 Achievement Unlocked!</h3>
                    ${gameUpdate.newAchievements.map(achievement => `
                        <div class="achievement-item">
                            <span class="achievement-icon">${achievement.icon}</span>
                            <div class="achievement-text">
                                <strong>${achievement.name}</strong>
                                <p>${achievement.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        let levelUpHTML = '';
        if (gameUpdate.leveledUp) {
            levelUpHTML = `
                <div class="distrax-level-up">
                    <h3>🎉 LEVEL UP!</h3>
                    <p>You've reached Level ${gameUpdate.state.level}!</p>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="distrax-modal-content distrax-motivation-content">
                <div class="distrax-modal-header">
                    <div class="distrax-logo">
                        <span class="distrax-icon">💪</span>
                        <span class="distrax-title">Great Choice!</span>
                    </div>
                    <div class="distrax-reward">
                        <span class="xp-gained">+20 XP</span>
                        <span class="level-display">Level ${gameUpdate.state.level}</span>
                    </div>
                </div>
                <div class="distrax-modal-body">
                    ${levelUpHTML}
                    ${achievementHTML}
                    <div class="distrax-motivation-text">
                        <h2>You're building great habits! 🌟</h2>
                        <div class="distrax-quote">
                            <p>"${quote}"</p>
                        </div>
                        <div class="distrax-stats-summary">
                            <div class="stat-item">
                                <span class="stat-number">${gameUpdate.state.streak}</span>
                                <span class="stat-label">Day Streak</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${gameUpdate.state.totalProductiveChoices}</span>
                                <span class="stat-label">Productive Choices</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${Math.round((gameUpdate.state.totalProductiveChoices / gameUpdate.state.totalVisits) * 100)}%</span>
                                <span class="stat-label">Success Rate</span>
                            </div>
                        </div>
                        <p class="distrax-productivity-message">
                            Time to be productive! Your future self will thank you! 🚀
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
            // Update game state - not productive choice
            const gameUpdate = updateGameState(false);
            
            // Remove blur and modal
            overlay.remove();
            modal.remove();
        });

        document.getElementById('distrax-no').addEventListener('click', function() {
            // Update game state - productive choice
            const gameUpdate = updateGameState(true);
            
            // Remove current modal
            modal.remove();
            
            // Show motivation modal with game stats
            const motivationModal = createMotivationModal(gameUpdate);
            
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