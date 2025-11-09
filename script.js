// --- Single Page Application Logic ---

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