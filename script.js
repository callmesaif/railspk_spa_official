// --- Single Page Application Logic ---

tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'rail-dark': '#111827', /* Very dark blue-gray from image */
                        'rail-accent': '#4f46e5', /* Indigo from image */
                        'rail-light-blue': '#6366f1', /* Lighter indigo for highlights */
                        'rail-secondary': '#374151', /* Slightly lighter dark for elements */
                        'rail-text': '#d1d5db', /* Light gray text */
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        heading: ['Poppins', 'sans-serif'], /* For titles */
                    }
                }
            }
        }

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
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    
    const embedContainer = document.getElementById('latest-video-embed');
    if (embedContainer) {
        embedContainer.innerHTML = '<p class="text-gray-300 p-6">Loading your latest vlog...</p>';
    }
}

// Event listener (ESC key) for Video Modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('latest-video-modal'); 
        if (modal && !modal.classList.contains('hidden')) {
            closeModal('latest-video-modal');
        }
        
        // (NEW) ESC key image modal ko bhi band karegi
        const imgModal = document.getElementById('image-modal');
        if (imgModal && !imgModal.classList.contains('hidden')) {
            closeImageModal();
        }
    }
});


// --- (NEW) 3. Image Modal (Lightbox) Functions ---
function openImageModal(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image-content');
    
    if (modal && modalImg) {
        modalImg.src = imageSrc; // Click ki gayi image ka link set karein
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Modal dikhayein
        document.body.classList.add('overflow-hidden'); // Background scroll band karein
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex'); // Modal chupayein
        document.body.classList.remove('overflow-hidden'); // Background scroll wapas chalu
    }
}
// --- (END OF NEW FUNCTIONS) ---


// --- YouTube Integration Logic ---
const YOUTUBE_API_KEY = 'AIzaSyAJySKdCS1_BNrvFAf6hGtvMbU0TLgO_7w'; // Aapki API key
const CHANNEL_ID = 'UC0jiPBcE-2QbiBLt2m3MHSQ'; // Aapka YouTube channel ID

async function fetchLatestLongVideo() {
    const embedContainer = document.getElementById('latest-video-embed');
    const modalId = 'latest-video-modal';
    
    embedContainer.innerHTML = '<p class="text-gray-300 p-6">Latest vlog load ho raha hai...</p>';
    showModal(modalId);

    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY' || !CHANNEL_ID || CHANNEL_ID === 'YOUR_YOUTUBE_CHANNEL_ID') {
        embedContainer.innerHTML = '<p class="text-red-400 p-6">YouTube API Key ya Channel ID set nahi hai. Kripya script.js mein update karein.</p>';
        return;
    }

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5&type=video&videoDuration=long`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API Request failed with status: ${response.status}`);
        
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            const title = data.items[0].snippet.title;
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
        } else {
            embedContainer.innerHTML = '<p class="text-gray-400 p-6">Humari search mein koi naya long video (vlog) nahi mila.</p>';
        }
    } catch (error) {
        console.error('Latest vlog fetch karne mein ghalti (Error fetching latest vlog):', error);
        embedContainer.innerHTML = `
            <div class="p-6 text-center">
                <p class="text-red-400 font-bold mb-2">Video load nahi ho saka.</p>
                <p class="text-red-300 text-sm">Mumkin hai API key galat ho ya network issue ho. Console mein error dekhein.</p>
            </div>
        `;
    }
}


/**
 * (NEW) Channel se 3 naye (latest) *LONG* videos fetch karta hai.
 * (Yeh index.html par "Discover" section ke liye hai)
 */
async function fetchFeaturedVideos() {
    const container = document.getElementById('video-cards-container');
    if (!container) return; // Sirf index.html par chalega

    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY' || !CHANNEL_ID || CHANNEL_ID === 'YOUR_YOUTUBE_CHANNEL_ID') {
        container.innerHTML = '<p class="text-red-400 text-center col-span-3">API Key/Channel ID not set in script.js</p>';
        return;
    }

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=3&type=video&videoDuration=long`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API Request failed: ${response.status}`);
        
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            container.innerHTML = ''; // Loading message hatayein

            data.items.forEach(item => {
                const videoId = item.id.videoId;
                const title = item.snippet.title;
                const shortTitle = title.length > 55 ? title.substring(0, 55) + '...' : title;
                const desc = item.snippet.description.substring(0, 80) + '...';

                const cardHtml = `
                <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 content-card flex flex-col">
                    <div class="w-full aspect-video bg-gray-700 flex items-center justify-center relative"
                         onclick="window.open('https://www.youtube.com/watch?v=${videoId}', '_blank')">
                        <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" onerror="this.onerror=null; this.src='https://via.placeholder.co/400x225/374151/d1d5db?text=Video'" alt="${title}" class="w-full h-full object-cover">
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

        } else {
            container.innerHTML = '<p class="text-gray-400 text-center col-span-3">No featured vlogs found.</p>';
        }

    } catch (error) {
        console.error('Featured videos fetch karne mein ghalti:', error);
        container.innerHTML = '<p class="text-red-400 text-center col-span-3">Could not load videos. Check console.</p>';
    }
}


// Initial setup call (UPDATED)
document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedVideos(); // Naya function yahan call hoga (index.html ke "Discover" section ke liye)
});


// --- Interactive Route Map Logic (PLAYLIST-BASED) ---
const playlistDatabase = {
    'khi-lhr': 'PLs_uju7fb5bcAC1y4S-wO04bL5II2ib2_',
    'rwp-khi': 'PLs_uju7fb5bfenUjQ3Zc6ZGvAMhtzby_N',
    'khi-roh': 'PLs_uju7fb5bfoF55xpJji7_cat6RW9V9O',
};

async function loadPlaylist(route) {
    const resultsContainer = document.getElementById('route-video-results');
    if (!resultsContainer) return; // Sirf routes.html par chalega

    const playlistId = playlistDatabase[route];
    if (!playlistId || playlistId.startsWith('YOUR_')) {
        resultsContainer.innerHTML = `<p class="text-red-400 text-center col-span-3">Is route ke liye Playlist ID set nahi hai (script.js).</p>`;
        return;
    }

    resultsContainer.innerHTML = `<p class="text-gray-400 text-center col-span-3">Loading vlogs for this route...</p>`;
    if (!YOUTUBE_API_KEY) {
        resultsContainer.innerHTML = `<p class="text-red-400 text-center col-span-3">API Key not set.</p>`;
        return;
    }

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${playlistId}&part=snippet&maxResults=25`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API Request failed: ${response.status}`);
        
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            resultsContainer.innerHTML = '';
            data.items.forEach(item => {
                const snippet = item.snippet;
                const videoId = snippet.resourceId.videoId;
                const title = snippet.title;
                const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; 

                const cardHtml = `
                <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 content-card"
                     onclick="window.open('https://www.youtube.com/watch?v=${videoId}', '_blank')">
                    <div class="w-full aspect-video bg-gray-700 relative">
                        <img src="${thumbnail}" alt="${title}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <svg class="w-16 h-16 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24"><path d="M6 3l12 9-12 9V3z"/></svg>
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="text-xl font-semibold text-white mb-2">${title}</h3>
                    </div>
                </div>`;
                resultsContainer.innerHTML += cardHtml;
            });
        } else {
            resultsContainer.innerHTML = '<p class="text-gray-400 text-center col-span-3">Is playlist mein koi videos nahi milein.</p>';
        }
    } catch (error) {
        console.error('Playlist fetch karne mein ghalti:', error);
        resultsContainer.innerHTML = `<p class="text-red-400 text-center col-span-3">Vlogs load nahi ho sake. (Error: ${error.message})</p>`;
    }
}

// --- NEW: Photo Gallery Function (Legacy from previous step, kept for changeImage) ---
// (Yeh function abhi istemal nahi ho raha, lekin agar aap future mein thumbnails use karein toh kaam aayega)
function changeImage(thumbnailElement, mainImageId) {
    const newSrc = thumbnailElement.src;
    const mainImage = document.getElementById(mainImageId);
    mainImage.src = newSrc;
    const parentContainer = thumbnailElement.parentElement;
    const allThumbnails = parentContainer.getElementsByClassName('thumbnail');
    for (let thumb of allThumbnails) {
        thumb.classList.remove('thumbnail-active');
    }
    thumbnailElement.classList.add('thumbnail-active');
}

// --- Slideshow Function ---
// (Yeh reviews.html ke liye hai)
function moveSlide(n, scorecardId) {
    const slides = document.querySelectorAll(`#${scorecardId} .slide`);
    if (slides.length === 0) return; 

    let currentIndex = 0;
    for (let i = 0; i < slides.length; i++) {
        if (!slides[i].classList.contains('hidden')) {
            currentIndex = i;
            break;
        }
    }

    slides[currentIndex].classList.add('hidden');
    let newIndex = currentIndex + n;

    if (newIndex >= slides.length) {
        newIndex = 0; // Loop to start
    }
    if (newIndex < 0) {
        newIndex = slides.length - 1; // Loop to end
    }

    slides[newIndex].classList.remove('hidden');
}