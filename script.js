// --- Global State for Pagination ---
let nextPageToken = null;
let currentDurationFilter = 'long'; // Default filter

// --- Single Page Application Logic ---

// 1. Mobile Menu Toggle
function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// 2. Modal Functions (Video Player)
function showModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden'); 
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    
    // Check karein agar koi aur modal (jaise Image Modal) open na ho, tabhi scroll enable karein
    const imgModal = document.getElementById('image-modal');
    if (!imgModal || imgModal.classList.contains('hidden')) {
        document.body.classList.remove('overflow-hidden');
    }

    const embedContainer = document.getElementById('latest-video-embed');
    if (embedContainer) {
        // Iframe ko hatane se video ruk jaayegi.
        embedContainer.innerHTML = '<p class="text-gray-300 p-6">Loading your latest vlog...</p>';
    }
}

// Event listener (ESC key) for Modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Video Modal
        const modal = document.getElementById('latest-video-modal'); 
        if (modal && !modal.classList.contains('hidden')) {
            closeModal('latest-video-modal');
        }
        // Image Modal
        const imgModal = document.getElementById('image-modal');
        if (imgModal && !imgModal.classList.contains('hidden')) {
            closeImageModal();
        }
    }
});


// --- 3. Custom Player Opener ---
function openFeaturedVideo(videoId, title) {
    const embedContainer = document.getElementById('latest-video-embed');
    const modalId = 'latest-video-modal';
    
    showModal(modalId);

    embedContainer.innerHTML = `
        <iframe 
            class="w-full h-full rounded-md" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            title="${title}">
        </iframe>
    `;
}


// --- 4. Image Modal (Lightbox) Functions ---
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

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        
        // FIX for Scrolling Issue: Sirf tabhi scroll enable karein jab koi aur modal open na ho.
        const videoModal = document.getElementById('latest-video-modal');
        if (!videoModal || videoModal.classList.contains('hidden')) {
            document.body.classList.remove('overflow-hidden');
        }
    }
}


// --- 5. Scorecard Slideshow Logic (Previous Fix) ---
function moveSlide(step, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Har scorecard mein slides container ko dhoondhen
    const slideshowContainer = container.querySelector('.slideshow-container');
    if (!slideshowContainer) return;
    
    const slides = slideshowContainer.querySelectorAll('.slide');
    let currentIdx = -1;

    // Current active slide dhoondein (wo slide jis par 'hidden' class nahi hai)
    slides.forEach((slide, index) => {
        if (!slide.classList.contains('hidden')) {
            currentIdx = index;
        }
    });

    if (currentIdx === -1) {
        // Agar koi slide active nahi hai, toh pehli slide ko active kar dein.
        slides[0].classList.remove('hidden');
        currentIdx = 0;
    }
    
    // Pehle wali slide chhupayein
    slides[currentIdx].classList.add('hidden');

    // Agli slide ka index calculate karein
    let nextIdx = (currentIdx + step + slides.length) % slides.length;

    // Nayi slide dikhayein
    slides[nextIdx].classList.remove('hidden');
}

// --- YouTube Integration Logic ---
const YOUTUBE_API_KEY = 'AIzaSyAJySKdCS1_BNrvFAf6hGtvMbU0TLgO_7w'; 
const CHANNEL_ID = 'UC0jiPBcE-2QbiBLt2m3MHSQ'; 

/**
 * (For index.html "Explore Our Journeys" section)
 * @param {string} durationFilter - long, medium, short, or any.
 * @param {string} pageToken - For loading the next page of results.
 * @param {boolean} appendMode - True agar videos ko existing list mein jodna hai.
 */
async function fetchFeaturedVideos(durationFilter, pageToken = null, appendMode = false) {
    const container = document.getElementById('video-cards-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!container || !loadMoreBtn) return; 

    // Button ko disable karein aur loading message dikhayein
    loadMoreBtn.disabled = true;
    if (!appendMode) {
        container.innerHTML = `<p class="text-gray-400 text-center col-span-3 py-10">Loading videos for ${durationFilter} duration...</p>`;
    }

    if (!YOUTUBE_API_KEY || !CHANNEL_ID) {
        container.innerHTML = '<p class="text-red-400 text-center col-span-3">API Key/Channel ID set nahi hai.</p>';
        return;
    }

    try {
        let apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=6&type=video&videoDuration=${durationFilter}`;
        
        if (pageToken) {
            apiUrl += `&pageToken=${pageToken}`;
        }
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API Request failed: ${response.status}`);
        
        const data = await response.json();
        
        // Global state update
        nextPageToken = data.nextPageToken || null;

        if (data.items && data.items.length > 0) {
            if (!appendMode) {
                container.innerHTML = ''; // Pehle ke videos clear karein agar new filter hai
            }
            
            data.items.forEach(item => {
                const videoId = item.id.videoId;
                const title = item.snippet.title.replace(/'/g, "\\'"); 
                const shortTitle = title.length > 55 ? title.substring(0, 55) + '...' : title;
                const desc = item.snippet.description.substring(0, 80) + '...';

                const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

                const cardHtml = `
                <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 content-card flex flex-col">
                    <div class="w-full aspect-video bg-gray-700 flex items-center justify-center relative"
                         onclick="openFeaturedVideo('${videoId}', '${title}')">
                        <img src="${thumbnail}" onerror="this.onerror=null; this.src='https://via.placeholder.co/400x225/374151/d1d5db?text=Video'" alt="${title}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <svg class="w-16 h-16 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24"><path d="M6 3l12 9-12 9V3z"/></svg>
                        </div>
                    </div>
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="text-xl font-semibold text-white mb-2 h-14">${shortTitle}</h3>
                        <p class="text-gray-400 text-sm mb-4">${desc}</p>
                    </div>
                </div>`;
                
                container.innerHTML += cardHtml;
            });
            
            // Button ko dobara enable karein agar next page available hai
            if (nextPageToken) {
                loadMoreBtn.disabled = false;
            } else {
                // Agar koi aur page nahi hai toh button chupa dein
                loadMoreBtn.style.display = 'none';
                if (!appendMode) {
                     // Agar pehle page par hi 6 se kam videos hain aur no next page, tab bhi button chhupa do
                }
            }

        } else {
            if (!appendMode) {
                container.innerHTML = '<p class="text-gray-400 text-center col-span-3">Koi videos nahi milein. Filter criteria change kar ke dekhein.</p>';
            }
            loadMoreBtn.style.display = 'none'; // Button chhupa dein
        }

    } catch (error) {
        console.error('Featured videos fetch karne mein ghalti:', error);
        container.innerHTML = '<p class="text-red-400 text-center col-span-3">Videos load nahi ho sake. (API Error)</p>';
        loadMoreBtn.disabled = true;
    }
}


// --- Hero Slideshow Logic ---
function startHeroSlideshow() {
    const slides = document.querySelectorAll('#hero-slideshow-container .hero-slide');
    if (slides.length < 2) return; 

    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    slides[currentSlide].classList.add('active');

    setInterval(nextSlide, 5000); 
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Load
    fetchFeaturedVideos(currentDurationFilter); 
    startHeroSlideshow(); 
    
    // 2. Filter Event Listener
    const filterSelect = document.getElementById('video-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (event) => {
            currentDurationFilter = event.target.value;
            nextPageToken = null; // Filter change hone par pagination reset karein
            document.getElementById('load-more-btn').style.display = 'inline-flex'; // Button dobara dikhayein
            fetchFeaturedVideos(currentDurationFilter);
        });
    }
    
    // 3. Load More Button Listener
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            if (nextPageToken) {
                fetchFeaturedVideos(currentDurationFilter, nextPageToken, true); // Append mode ON
            }
        });
    }
});