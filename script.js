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

// --- Interactive Route Map Logic ---

// Aap ke vlogs ki ek 'database' (aap isko expand kar sakte hain)
const videoDatabase = {
    // Karachi to Lahore Route ke Vlogs
    'khi-lhr': [
        { 
            id: 'nHADX1DrIjU', // Karakorum Express ID
            title: 'Karakorum Express: Lahore To Karachi', 
            desc: "Reviewing Pakistan's The Best train service." 
        }
    ],
    // Rawalpindi to Karachi Route ke Vlogs
    'rwp-khi': [
        { 
            id: 'udrUFc8DGns', // Green Line ID
            title: 'Green Line Express: Margala To Karachi', 
            desc: "Reviewing Pakistan's Premium & Luxury train service." 
        },
        { 
            id: 'UFaskYWgqHM', // Karachi Express ID
            title: 'Karachi Express: Traveling In Winter', 
            desc: 'A mesmerizing vlog of the scenic route.' 
        }
    ]
};

/**
 * Route ke hisab se video cards filter aur display karta hai.
 */
function showVideos(route) {
    const resultsContainer = document.getElementById('route-video-results');
    resultsContainer.innerHTML = ''; // Pehle results clear karein
    
    let videosToShow = [];

    if (route === 'all') {
        // Sab routes se videos jama karein
        videosToShow = [...videoDatabase['khi-lhr'], ...videoDatabase['rwp-khi']];
    } else if (videoDatabase[route]) {
        // Sirf selected route ke videos
        videosToShow = videoDatabase[route];
    }

    // Check karein agar koi video mila hai
    if (videosToShow.length === 0) {
        resultsContainer.innerHTML = '<p class="text-gray-400 text-center col-span-3">No vlogs found for this route yet.</p>';
        return;
    }

    // Har video ke liye HTML card banayein
    videosToShow.forEach(video => {
        // Yeh HTML structure aap ke index.html se liya gaya hai
        const cardHtml = `
        <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 content-card"
             onclick="window.open('https://www.youtube.com/watch?v=${video.id}', '_blank')">
            <div class="w-full aspect-video bg-gray-700 relative">
                <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${video.title}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <svg class="w-16 h-16 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24"><path d="M6 3l12 9-12 9V3z"/></svg>
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-xl font-semibold text-white mb-2">${video.title}</h3>
                <p class="text-gray-400 text-sm">${video.desc}</p>
            </div>
        </div>`;
        resultsContainer.innerHTML += cardHtml;
    });
}