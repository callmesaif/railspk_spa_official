// --- Global State for Pagination ---
let nextPageToken = null;
let currentDurationFilter = 'long'; 

// --- Single Page Application Logic ---

/**
 * Mobile menu toggle functionality
 */
function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

/**
 * Universal Modal Show Function with defensive check
 */
function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden'); 
}

/**
 * Universal Modal Close Function with defensive checks
 */
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    
    // Check if ANY other modal is still open before re-enabling scroll
    const imgModal = document.getElementById('image-modal');
    const videoModal = document.getElementById('latest-video-modal');
    
    const isImgOpen = imgModal && !imgModal.classList.contains('hidden');
    const isVidOpen = videoModal && !videoModal.classList.contains('hidden');

    if (!isImgOpen && !isVidOpen) {
        document.body.classList.remove('overflow-hidden');
    }

    const embedContainer = document.getElementById('latest-video-embed');
    if (embedContainer) {
        embedContainer.innerHTML = '<p class="text-gray-300 p-6">Loading...</p>';
    }
}

// Global ESC key listener for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const videoModal = document.getElementById('latest-video-modal'); 
        if (videoModal && !videoModal.classList.contains('hidden')) {
            closeModal('latest-video-modal');
        }
        const imgModal = document.getElementById('image-modal');
        if (imgModal && !imgModal.classList.contains('hidden')) {
            closeImageModal();
        }
    }
});

/**
 * Video Player Opener
 */
function openFeaturedVideo(videoId, title) {
    const embedContainer = document.getElementById('latest-video-embed');
    showModal('latest-video-modal');
    if (embedContainer) {
        embedContainer.innerHTML = `
            <iframe class="w-full h-full rounded-md" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
        `;
    }
}

/**
 * Image Modal Opener
 */
function openImageModal(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image-content');
    if (modal && modalImg) {
        modalImg.src = imageSrc;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
    }
}

/**
 * Image Modal Closer with defensive logic for scrolling
 */
function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    
    // Defensive check: Only enable scroll if Video Modal is also closed (or doesn't exist)
    const videoModal = document.getElementById('latest-video-modal');
    const isVidOpen = videoModal && !videoModal.classList.contains('hidden');
    
    if (!isVidOpen) {
        document.body.classList.remove('overflow-hidden');
    }
}

// --- Scorecard Slideshow Logic ---

/**
 * Moves slides for the scorecard section
 */
function moveSlide(step, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    if (slides.length <= 1) return;

    let currentIdx = -1;
    slides.forEach((slide, index) => {
        if (!slide.classList.contains('hidden')) currentIdx = index;
    });

    if (currentIdx === -1) currentIdx = 0;
    
    slides[currentIdx].classList.add('hidden');
    let nextIdx = (currentIdx + step + slides.length) % slides.length;
    slides[nextIdx].classList.remove('hidden');
}

/**
 * Starts automatic slideshow for a scorecard
 */
function startScorecardSlideshow(containerId) {
    if (document.getElementById(containerId)) {
        setInterval(() => moveSlide(1, containerId), 4000);
    }
}

// --- YouTube Integration Logic ---
const YOUTUBE_API_KEY = 'AIzaSyAJySKdCS1_BNrvFAf6hGtvMbU0TLgO_7w'; 
const CHANNEL_ID = 'UC0jiPBcE-2QbiBLt2m3MHSQ'; 

async function fetchFeaturedVideos(durationFilter, pageToken = null, appendMode = false) {
    const container = document.getElementById('video-cards-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!container) return; 

    if (loadMoreBtn) loadMoreBtn.disabled = true;
    if (!appendMode) container.innerHTML = `<p class="text-gray-400 text-center col-span-3 py-10">Loading journeys...</p>`;

    try {
        let apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=6&type=video&videoDuration=${durationFilter}`;
        if (pageToken) apiUrl += `&pageToken=${pageToken}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("API call failed");
        
        const data = await response.json();
        nextPageToken = data.nextPageToken || null;

        if (data.items && data.items.length > 0) {
            if (!appendMode) container.innerHTML = '';
            data.items.forEach(item => {
                const videoId = item.id.videoId;
                const title = item.snippet.title.replace(/'/g, "\\'"); 
                const cardHtml = `
                <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col">
                    <div class="w-full aspect-video bg-gray-700 relative cursor-pointer" onclick="openFeaturedVideo('${videoId}', '${title}')">
                        <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <svg class="w-16 h-16 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24"><path d="M6 3l12 9-12 9V3z"/></svg>
                        </div>
                    </div>
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="text-xl font-semibold text-white mb-2 h-14">${title.substring(0, 55)}...</h3>
                    </div>
                </div>`;
                container.innerHTML += cardHtml;
            });
            if (loadMoreBtn) loadMoreBtn.style.display = nextPageToken ? 'inline-flex' : 'none';
        }
    } catch (e) { 
        console.error("YouTube Error:", e);
        if (container && !appendMode) container.innerHTML = `<p class="text-red-400 text-center col-span-3">Failed to load videos.</p>`;
    }
    if (loadMoreBtn) loadMoreBtn.disabled = false;
}

/**
 * Starts the main hero section slideshow
 */
function startHeroSlideshow() {
    const container = document.getElementById('hero-slideshow-container');
    if (!container) return;
    
    const slides = container.querySelectorAll('.hero-slide');
    if (slides.length < 2) return; 
    
    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Home Page Initialization
    if (document.getElementById('video-cards-container')) {
        fetchFeaturedVideos(currentDurationFilter);
    }
    if (document.getElementById('hero-slideshow-container')) {
        startHeroSlideshow();
    }
    
    // 2. Reviews Page Scorecards Initialization
    const trainIds = [
        'greenline', 'pakbusiness', 'shalimar', 'karakoram'];
    
    trainIds.forEach(id => {
        const fullId = `scorecard-${id}`;
        if (document.getElementById(fullId)) {
            startScorecardSlideshow(fullId);
        }
    });

    // 3. Filter Event Listener
    const filterSelect = document.getElementById('video-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            currentDurationFilter = e.target.value;
            nextPageToken = null;
            fetchFeaturedVideos(currentDurationFilter);
        });
    }
    
    // 4. Load More Listener
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            if (nextPageToken) fetchFeaturedVideos(currentDurationFilter, nextPageToken, true);
        });
    }
});