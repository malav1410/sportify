// Challenges page functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log("Challenges module loaded");
    
    // Only initialize if we're on the challenges page
    if (!document.getElementById('challenges-container')) {
        return;
    }
    
    // DOM Elements
    const challengesContainer = document.getElementById('challenges-container');
    const filtersForm = document.getElementById('challenges-filters');
    const sportFilter = document.getElementById('sport-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const searchInput = document.getElementById('search-filter');
    const loadingIndicator = document.getElementById('challenges-loading');
    const paginationContainer = document.getElementById('challenges-pagination');
    
    // State
    let currentFilters = {
        sport_type: '',
        difficulty: '',
        search: '',
        page: 1
    };
    
    // API URL - should be configured based on environment
    const API_BASE_URL = '/api/v1';
    
    // Initialize the page
    initChallengePage();
    
    // Functions
    function initChallengePage() {
        // Add event listeners
        if (filtersForm) {
            filtersForm.addEventListener('submit', (e) => {
                e.preventDefault();
                applyFilters();
            });
        }
        
        if (sportFilter) {
            sportFilter.addEventListener('change', () => {
                currentFilters.sport_type = sportFilter.value;
                currentFilters.page = 1;
                fetchChallenges();
            });
        }
        
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => {
                currentFilters.difficulty = difficultyFilter.value;
                currentFilters.page = 1;
                fetchChallenges();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                currentFilters.search = searchInput.value;
                currentFilters.page = 1;
                fetchChallenges();
            }, 500));
        }
        
        // Initial fetch
        fetchChallenges();
    }
    
    function applyFilters() {
        if (sportFilter) currentFilters.sport_type = sportFilter.value;
        if (difficultyFilter) currentFilters.difficulty = difficultyFilter.value;
        if (searchInput) currentFilters.search = searchInput.value;
        currentFilters.page = 1;
        
        fetchChallenges();
    }
    
    function fetchChallenges() {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (currentFilters.sport_type) queryParams.append('sport_type', currentFilters.sport_type);
        if (currentFilters.difficulty) queryParams.append('difficulty', currentFilters.difficulty);
        if (currentFilters.search) queryParams.append('search', currentFilters.search);
        queryParams.append('page', currentFilters.page);
        queryParams.append('per_page', 12); // Adjust as needed
        
        const url = `${API_BASE_URL}/challenges?${queryParams.toString()}`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                renderChallenges(data.challenges);
                renderPagination(data.meta);
            })
            .catch(error => {
                console.error('Error fetching challenges:', error);
                challengesContainer.innerHTML = `
                    <div class="error-message p-4 text-center text-red-600">
                        <p>Failed to load challenges. Please try again later.</p>
                    </div>
                `;
            })
            .finally(() => {
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            });
    }
    
    function renderChallenges(challenges) {
        if (!challengesContainer) return;
        
        if (!challenges || challenges.length === 0) {
            challengesContainer.innerHTML = `
                <div class="empty-state p-8 text-center">
                    <h3 class="text-xl font-bold mb-2">No challenges found</h3>
                    <p class="text-gray-500">Try adjusting your filters or check back later for new challenges.</p>
                </div>
            `;
            return;
        }
        
        challengesContainer.innerHTML = challenges.map(challenge => createChallengeCard(challenge)).join('');
        
        // Add event listeners to the challenge cards
        document.querySelectorAll('.challenge-card').forEach(card => {
            card.addEventListener('click', () => {
                const challengeId = card.dataset.id;
                // Use the correct path based on whether we're in the directory or the HTML file
                const isInDirectory = window.location.pathname.includes('/challenges/');
                if (isInDirectory) {
                    window.location.href = `/game/challenge-detail?id=${challengeId}`;
                } else {
                    window.location.href = `/game/challenge-detail.html?id=${challengeId}`;
                }
            });
        });
    }
    
    function createChallengeCard(challenge) {
        // Helper function to get the badge color based on difficulty
        const getDifficultyColor = (difficulty) => {
            switch (difficulty) {
                case 'easy': return 'bg-green-100 text-green-800';
                case 'medium': return 'bg-yellow-100 text-yellow-800';
                case 'hard': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };
        
        // Helper function to get badge icon based on challenge type
        const getChallengeTypeIcon = (type) => {
            switch (type) {
                case 'celebrity': return '<i class="fas fa-star mr-1"></i>';
                case 'bumper': return '<i class="fas fa-trophy mr-1"></i>';
                default: return '';
            }
        };
        
        return `
            <div class="challenge-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300" data-id="${challenge.id}">
                <div class="relative h-40 bg-gray-200">
                    <img src="${challenge.thumbnail_url || '/game/images/challenge-placeholder.jpg'}" alt="${challenge.title}" class="w-full h-full object-cover">
                    ${challenge.is_paid ? '<span class="absolute top-2 right-2 bg-sporty-red text-white text-xs font-bold py-1 px-2 rounded">Premium</span>' : ''}
                </div>
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(challenge.difficulty)}">
                            ${challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                        </span>
                        <span class="text-gray-500 text-sm">${challenge.points_reward} pts</span>
                    </div>
                    <h3 class="text-lg font-bold mb-1">${challenge.title}</h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${challenge.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-500">${challenge.sport_type.charAt(0).toUpperCase() + challenge.sport_type.slice(1)}</span>
                        ${challenge.badge_reward ? `
                            <span class="inline-flex items-center text-xs font-medium text-blue-600">
                                <i class="fas fa-medal mr-1"></i> Badge Reward
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    function renderPagination(meta) {
        const paginationContainer = document.getElementById('challenges-pagination');
        if (!paginationContainer || !meta) return;
        
        // Don't show pagination if there's only one page
        if (meta.total_pages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = `
            <div class="flex justify-center space-x-2 mt-6">
                <button class="pagination-prev px-3 py-1 rounded border ${meta.current_page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                        ${meta.current_page === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
        `;
        
        // Add page numbers
        for (let i = 1; i <= meta.total_pages; i++) {
            // Only show a limited number of pages with ellipsis
            if (
                i === 1 || // Always show first page
                i === meta.total_pages || // Always show last page
                (i >= meta.current_page - 1 && i <= meta.current_page + 1) // Show current page and adjacent pages
            ) {
                paginationHTML += `
                    <button class="pagination-page px-3 py-1 rounded border ${i === meta.current_page ? 'bg-sporty-red text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (
                (i === meta.current_page - 2 && meta.current_page > 3) || 
                (i === meta.current_page + 2 && meta.current_page < meta.total_pages - 2)
            ) {
                paginationHTML += `<span class="px-3 py-1">...</span>`;
            }
        }
        
        paginationHTML += `
                <button class="pagination-next px-3 py-1 rounded border ${meta.current_page === meta.total_pages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                        ${meta.current_page === meta.total_pages ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Add event listeners for pagination
        const prevButton = paginationContainer.querySelector('.pagination-prev');
        const nextButton = paginationContainer.querySelector('.pagination-next');
        const pageButtons = paginationContainer.querySelectorAll('.pagination-page');
        
        if (prevButton && !prevButton.disabled) {
            prevButton.addEventListener('click', () => {
                currentFilters.page = Math.max(1, meta.current_page - 1);
                fetchChallenges();
            });
        }
        
        if (nextButton && !nextButton.disabled) {
            nextButton.addEventListener('click', () => {
                currentFilters.page = Math.min(meta.total_pages, meta.current_page + 1);
                fetchChallenges();
            });
        }
        
        pageButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentFilters.page = parseInt(button.dataset.page);
                fetchChallenges();
            });
        });
    }
    
    // Utility function to debounce input events
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
}); 