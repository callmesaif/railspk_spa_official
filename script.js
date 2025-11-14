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

// 2. Modal Functions (Simulated Video Player)
function showModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden'); // Scrolling band (Disable scrolling)
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden'); // Scrolling chalu (Enable scrolling)
    
    // Fix: Video band karo jab modal band ho.
    const embedContainer = document.getElementById('latest-video-embed');
    if (embedContainer) {
        // Iframe ko hatane se video ruk jaayegi.
        embedContainer.innerHTML = '<p class="text-gray-300 p-6">Loading your latest vlog...</p>';
    }
}

// Event listener to close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('latest-video-modal'); // Sirf ek modal ke liye
        if (modal && !modal.classList.contains('hidden')) {
            closeModal('latest-video-modal');
        }
    }
});

// --- YouTube Integration Logic ---
// Zaroori: Apni Asli API Key aur Channel ID yahan daalein.
const YOUTUBE_API_KEY = 'AIzaSyAJySKdCS1_BNrvFAf6hGtvMbU0TLgO_7w'; // Aapki API key
const CHANNEL_ID = 'UC0jiPBcE-2QbiBLt2m3MHSQ'; // Aapka YouTube channel ID

/**
 * Channel se latest long video (vlog) fetch karta hai aur modal mein embed karta hai.
 */
async function fetchLatestLongVideo() {
    const embedContainer = document.getElementById('latest-video-embed');
    const modalId = 'latest-video-modal';
    
    // 1. Shuruati Haisiyat: Modal aur Loading message dikhao
    embedContainer.innerHTML = '<p class="text-gray-300 p-6">Latest vlog load ho raha hai...</p>';
    showModal(modalId);

    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY' || !CHANNEL_ID || CHANNEL_ID === 'YOUR_YOUTUBE_CHANNEL_ID') {
        embedContainer.innerHTML = '<p class="text-red-400 p-6">YouTube API Key ya Channel ID set nahi hai. Kripya script.js mein update karein.</p>';
        return;
    }

    try {
        // videoDuration: "long" se sirf lambi videos (vlogs) filter hongi.
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5&type=video&videoDuration=long`;
        
        const response = await fetch(apiUrl);
        
        // Response check karein
        if (!response.ok) {
            throw new Error(`API Request failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            
            // Sabse naye long video ki ID nikal lein.
            const videoId = data.items[0].id.videoId;
            const title = data.items[0].snippet.title;

            // Video ko iframe mein embed karo
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
            // Note: autoplay=1 se video khud-ba-khud chalegi.
            
        } else {
            embedContainer.innerHTML = '<p class="text-gray-400 p-6">Humari search mein koi naya long video (vlog) nahi mila.</p>';
        }

    } catch (error) {
        console.error('Latest vlog fetch karne mein ghalti (Error fetching latest vlog):', error);
        
        // API error ka message user ko dikhao
        embedContainer.innerHTML = `
            <div class="p-6 text-center">
                <p class="text-red-400 font-bold mb-2">Video load nahi ho saka.</p>
                <p class="text-red-300 text-sm">Mumkin hai API key galat ho ya network issue ho. Console mein error dekhein.</p>
            </div>
        `;
    }
}


// Featured Content Function (Static content ke liye, ab zaroori nahi)
function loadFeaturedContent() {
    console.log('Static featured content load ho gaya hai.');
}


// Initial setup call 
document.addEventListener('DOMContentLoaded', loadFeaturedContent);

// --- Interactive Route Map Logic (PLAYLIST-BASED) ---

/**
 * (NEW) Yeh object aap ke routes ko aapki Playlist IDs se jorta (map) hai.
 * Aap ko yahan apni asli Playlist IDs daalni hongi.
 */
const playlistDatabase = {
    'khi-lhr': 'PLs_uju7fb5bcAC1y4S-wO04bL5II2ib2_',
    'rwp-khi': 'PLs_uju7fb5bfenUjQ3Zc6ZGvAMhtzby_N',
    'khi-roh': 'PLs_uju7fb5bfoF55xpJji7_cat6RW9V9O',
    // Example:
    // 'khi-lhr': 'PL_ABCdeF12G-hijKlmNOp456',
};

/**
 * (UPDATED) Yeh function ab 'route' ke hisab se Playlist ID uthata hai
 * aur YouTube API se uss playlist ke videos fetch karta hai.
 */
async function loadPlaylist(route) {
    const resultsContainer = document.getElementById('route-video-results');
    if (!resultsContainer) return; // Sirf routes.html par chalega

    // 1. Playlist ID hasil karein
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
        // 2. API call karein (playlistItems endpoint)
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${playlistId}&part=snippet&maxResults=25`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API Request failed: ${response.status}`);
        
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            resultsContainer.innerHTML = ''; // Clear loading message
            
            // 3. Har video ke liye HTML card banayein
            data.items.forEach(item => {
                const snippet = item.snippet;
                const videoId = snippet.resourceId.videoId;
                const title = snippet.title;
                // Behtar thumbnail quality ke liye 'maxresdefault' ya 'sddefault' try karein
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

// --- Slideshow Function (THE FIX) ---
function moveSlide(n, scorecardId) {
    // 1. Uss scorecard ke andar ke slides dhoondein
    const slides = document.querySelectorAll(`#${scorecardId} .slide`);
    if (slides.length === 0) return; // Agar slides nahi hain toh wapas

    let currentIndex = 0;
    // 2. Check karein ke abhi konsa slide active hai
    for (let i = 0; i < slides.length; i++) {
        if (!slides[i].classList.contains('hidden')) {
            currentIndex = i;
            break;
        }
    }

    // 3. Puranay slide ko hide karein
    slides[currentIndex].classList.add('hidden');

    // 4. Naya index calculate karein
    let newIndex = currentIndex + n;

    // 5. Check karein ke end ya start par pohanch gaye hain (Looping)
    if (newIndex >= slides.length) {
        newIndex = 0; // Aakhir se wapas pehle par
    }
    if (newIndex < 0) {
        newIndex = slides.length - 1; // Pehle se wapas aakhri par
    }

    // 6. Naya slide show karein
    slides[newIndex].classList.remove('hidden');
}