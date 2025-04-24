// Challenge Detail Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log("Challenge Detail module loaded");
    
    // Only initialize if we're on the challenge detail page
    if (!document.getElementById('challenge-header')) {
        return;
    }
    
    // State
    let challengeData = null;
    let userSubmission = null;
    
    // DOM Elements
    const challengeTitleBreadcrumb = document.getElementById('challenge-title-breadcrumb');
    const challengeTitle = document.getElementById('challenge-title');
    const challengeDescription = document.getElementById('challenge-description');
    const challengeDifficulty = document.getElementById('challenge-difficulty');
    const challengeSport = document.getElementById('challenge-sport');
    const challengeBadge = document.getElementById('challenge-badge');
    const challengePoints = document.getElementById('challenge-points');
    const equipmentList = document.getElementById('equipment-list');
    const timeLimit = document.getElementById('time-limit');
    const instructions = document.getElementById('instructions');
    const challengeStatus = document.getElementById('challenge-status');
    const submitChallengeBtn = document.getElementById('submit-challenge-btn');
    
    // API URL
    const API_BASE_URL = 'https://api.sportyfy.live/api/v1';
    
    // Get challenge ID from URL
    const challengeId = getChallengeIdFromUrl();
    
    // Initialize the page
    initDetailPage();
    
    // Functions
    function initDetailPage() {
        if (!challengeId) {
            showError('Invalid challenge ID');
            return;
        }
        
        // Fetch challenge details
        fetchChallengeDetails();
        
        // Add event listeners
        if (submitChallengeBtn) {
            submitChallengeBtn.addEventListener('click', handleSubmitChallenge);
        }
    }
    
    function getChallengeIdFromUrl() {
        // Extract challenge ID from URL pathname
        // Example: /challenges/123 -> 123
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }
    
    function fetchChallengeDetails() {
        const url = `${API_BASE_URL}/challenges/${challengeId}`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                challengeData = data;
                renderChallengeDetails();
                checkSubmissionStatus();
            })
            .catch(error => {
                console.error('Error fetching challenge details:', error);
                showError('Failed to load challenge details');
            });
    }
    
    function renderChallengeDetails() {
        if (!challengeData) return;
        
        // Update DOM elements with challenge data
        document.title = `${challengeData.title} | SPORTYFY.LIVE`;
        
        if (challengeTitleBreadcrumb) challengeTitleBreadcrumb.textContent = challengeData.title;
        if (challengeTitle) challengeTitle.textContent = challengeData.title;
        if (challengeDescription) challengeDescription.textContent = challengeData.description;
        
        // Update difficulty badge
        if (challengeDifficulty) {
            challengeDifficulty.textContent = capitalizeFirstLetter(challengeData.difficulty);
            // Update badge color based on difficulty
            challengeDifficulty.className = challengeDifficulty.className.replace(/bg-\w+-\d+ text-\w+-\d+/, getDifficultyColorClasses(challengeData.difficulty));
        }
        
        if (challengeSport) challengeSport.textContent = capitalizeFirstLetter(challengeData.sport_type);
        if (challengeBadge) challengeBadge.textContent = challengeData.badge_reward || 'No badge reward';
        if (challengePoints) challengePoints.textContent = `${challengeData.points_reward} points`;
        
        // Render equipment list
        if (equipmentList && challengeData.requirements && challengeData.requirements.equipment) {
            equipmentList.innerHTML = challengeData.requirements.equipment
                .map(item => `<li>${item}</li>`)
                .join('');
        }
        
        // Time limit
        if (timeLimit && challengeData.requirements && challengeData.requirements.duration_seconds) {
            const seconds = challengeData.requirements.duration_seconds;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            let timeText = '';
            if (minutes > 0) {
                timeText += `${minutes} minute${minutes > 1 ? 's' : ''}`;
            }
            if (remainingSeconds > 0) {
                timeText += timeText ? ' and ' : '';
                timeText += `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
            }
            
            timeLimit.textContent = `${seconds} seconds (${timeText})`;
        }
        
        // Instructions
        if (instructions && challengeData.requirements && challengeData.requirements.description) {
            instructions.textContent = challengeData.requirements.description;
        }
        
        // Update verification rules
        renderVerificationRules();
    }
    
    function renderVerificationRules() {
        const verificationContainer = document.getElementById('challenge-verification');
        if (!verificationContainer || !challengeData || !challengeData.verification_rules) return;
        
        const rules = Object.entries(challengeData.verification_rules)
            .filter(([key, value]) => value === true)
            .map(([key]) => formatVerificationRule(key));
        
        if (rules.length === 0) {
            verificationContainer.innerHTML = '<p class="text-gray-500">No specific verification rules for this challenge.</p>';
            return;
        }
        
        const rulesHTML = rules.map(rule => `
            <li class="flex items-start">
                <i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                <span>${rule}</span>
            </li>
        `).join('');
        
        verificationContainer.innerHTML = `<ul class="space-y-2 text-gray-700">${rulesHTML}</ul>`;
    }
    
    function formatVerificationRule(key) {
        // Convert snake_case to sentence case with better formatting
        const ruleMap = {
            'must_show_full_body': 'Full body must be visible in the frame',
            'must_show_ball_going_in': 'Ball going into the basket must be clearly visible',
            'continuous_footage': 'Video must be continuous without cuts or edits',
            'must_show_targets': 'Targets must be clearly visible in the frame',
            'must_show_contact': 'Contact with the ball must be clearly visible',
            'must_show_both_players': 'Both players must be visible in the frame',
            'must_show_continuous_rally': 'Continuous rally must be shown without breaks',
            'minimum_duration_seconds': 'Video must meet the minimum duration requirement',
            'no_ground_touches': 'Ball must not touch the ground during the challenge',
            'must_match_technique': 'Technique must match the demonstrated form',
            'must_complete_all_drills': 'All required drills must be completed'
        };
        
        return ruleMap[key] || key.split('_').map(capitalizeFirstLetter).join(' ');
    }
    
    function checkSubmissionStatus() {
        if (!challengeData) return;
        
        // Check if user has already submitted this challenge
        if (challengeData.has_submitted) {
            userSubmission = {
                status: challengeData.submission_status
            };
            updateSubmissionUI();
        } else {
            // User hasn't submitted this challenge yet
            renderDefaultStatus();
        }
    }
    
    function updateSubmissionUI() {
        if (!challengeStatus || !submitChallengeBtn || !userSubmission) return;
        
        // Update status message based on submission status
        let statusHTML = '';
        
        switch (userSubmission.status) {
            case 'pending':
                statusHTML = `
                    <div class="bg-yellow-50 text-yellow-700 rounded-md p-4">
                        <div class="flex">
                            <i class="fas fa-clock text-yellow-500 mt-0.5 mr-3"></i>
                            <div>
                                <p class="font-semibold">Your submission is pending review</p>
                                <p class="text-sm mt-1">We'll update you once it's been verified.</p>
                            </div>
                        </div>
                    </div>
                `;
                // Disable submit button
                submitChallengeBtn.disabled = true;
                submitChallengeBtn.classList.add('opacity-50', 'cursor-not-allowed');
                submitChallengeBtn.textContent = 'Already Submitted';
                break;
                
            case 'verified':
                statusHTML = `
                    <div class="bg-green-50 text-green-700 rounded-md p-4">
                        <div class="flex">
                            <i class="fas fa-check-circle text-green-500 mt-0.5 mr-3"></i>
                            <div>
                                <p class="font-semibold">Challenge Completed!</p>
                                <p class="text-sm mt-1">Congratulations! You've earned ${challengeData.points_reward} points${challengeData.badge_reward ? ` and the ${challengeData.badge_reward} badge` : ''}.</p>
                            </div>
                        </div>
                    </div>
                `;
                // Update submit button to view submission
                submitChallengeBtn.textContent = 'View Submission';
                submitChallengeBtn.classList.remove('bg-sporty-red', 'hover:bg-red-700');
                submitChallengeBtn.classList.add('bg-gray-700', 'hover:bg-gray-800');
                break;
                
            case 'rejected':
                statusHTML = `
                    <div class="bg-red-50 text-red-700 rounded-md p-4">
                        <div class="flex">
                            <i class="fas fa-exclamation-circle text-red-500 mt-0.5 mr-3"></i>
                            <div>
                                <p class="font-semibold">Submission Rejected</p>
                                <p class="text-sm mt-1">Your submission didn't meet all requirements. You can try again.</p>
                            </div>
                        </div>
                    </div>
                `;
                // Enable submit button
                submitChallengeBtn.textContent = 'Try Again';
                break;
                
            default:
                renderDefaultStatus();
        }
        
        challengeStatus.innerHTML = statusHTML;
    }
    
    function renderDefaultStatus() {
        if (!challengeStatus) return;
        
        challengeStatus.innerHTML = `
            <div class="bg-blue-50 text-blue-700 rounded-md p-4">
                <div class="flex">
                    <i class="fas fa-info-circle text-blue-500 mt-0.5 mr-3"></i>
                    <p>You haven't attempted this challenge yet.</p>
                </div>
            </div>
        `;
    }
    
    function handleSubmitChallenge() {
        // If user has already submitted and it's verified, navigate to submission page
        if (userSubmission && userSubmission.status === 'verified') {
            // Redirect to submission page (implement later)
            return;
        }
        
        // Check if challenge is paid
        if (challengeData.is_paid) {
            // Redirect to payment page (implement later)
            alert('This is a premium challenge. Payment processing will be implemented in a future update.');
            return;
        }
        
        // For now, just redirect to the submission form page
        window.location.href = `/game/submit-challenge/${challengeId}`;
    }
    
    function showError(message) {
        const container = document.querySelector('main .container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="bg-red-50 text-red-700 rounded-md p-6 text-center my-8">
                <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
                <h2 class="text-xl font-bold mb-2">Error</h2>
                <p>${message}</p>
                <a href="/game/challenges" class="inline-block mt-4 text-sporty-red hover:underline">
                    <i class="fas fa-arrow-left mr-1"></i> Back to Challenges
                </a>
            </div>
        `;
    }
    
    // Utility functions
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function getDifficultyColorClasses(difficulty) {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
}); 