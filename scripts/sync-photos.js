import fs from 'fs/promises';
import path from 'path';
import exifr from 'exifr';

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data', 'photos.json');

// Memory cache
let bbcHeadlinesCache = null;

async function getBBCHeadlines() {
    if (bbcHeadlinesCache) return bbcHeadlinesCache;
    try {
        const res = await fetch('https://feeds.bbci.co.uk/news/rss.xml');
        const text = await res.text();
        const matches = [...text.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/g)];
        bbcHeadlinesCache = matches.map(m => m[1]);
        return bbcHeadlinesCache;
    } catch {
        return [];
    }
}

async function getHeadlineForDate(dateObj) {
    const headlines = await getBBCHeadlines();
    if (!headlines || headlines.length === 0) return "BBC News Unavailable";

    // Pick a deterministic headline based on the date's day of year, so same day = same headline
    const start = new Date(dateObj.getFullYear(), 0, 0);
    const diff = (dateObj - start) + ((start.getTimezoneOffset() - dateObj.getTimezoneOffset()) * 60 * 1000);
    const MathDayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Fallback if dayOfYear is negative or NaN 
    const dayOfYear = MathDayOfYear > 0 ? MathDayOfYear : Math.floor(Math.random() * headlines.length);
    const index = dayOfYear % headlines.length;
    return headlines[index];
}

async function getPlaceName(lat, lng) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'User-Agent': 'TessasMemoriesApp/1.0' }
        });
        const data = await res.json();
        if (data.address) {
            return data.address.suburb || data.address.city || data.address.town || data.address.village || data.address.county || data.address.country || "Unknown Location";
        }
    } catch (e) {
        // ignore
    }
    return "Unknown Location";
}

async function processPhotos() {
    try {
        await fs.mkdir(PHOTOS_DIR, { recursive: true });
        await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

        const files = await fs.readdir(PHOTOS_DIR);
        const imageFiles = files.filter(file =>
            file.toLowerCase().endsWith('.jpg') ||
            file.toLowerCase().endsWith('.jpeg') ||
            file.toLowerCase().endsWith('.png') ||
            file.toLowerCase().endsWith('.heic')
        );

        console.log(`📸 Found ${imageFiles.length} photos in public/photos`);

        const photosData = [];

        for (const file of imageFiles) {
            const filePath = path.join(PHOTOS_DIR, file);
            const url = `/photos/${file}`;

            try {
                const metadata = await exifr.parse(filePath) || {};
                const gps = await exifr.gps(filePath);

                // Extract Date (fallback to file birth time if EXIF date is missing)
                let date = metadata.DateTimeOriginal || metadata.CreateDate || metadata.ModifyDate;
                if (!date) {
                    const stat = await fs.stat(filePath);
                    date = stat.birthtime;
                }

                const dateObj = new Date(date);

                // Try extracting GPS. 
                let lat = 51.5074; // London fallback
                let lng = -0.1278;

                if (gps && gps.latitude && gps.longitude) {
                    lat = gps.latitude;
                    lng = gps.longitude;
                }

                const placeName = await getPlaceName(lat, lng);
                const headline = await getHeadlineForDate(dateObj);

                photosData.push({
                    id: file,
                    url,
                    date: dateObj.toISOString(),
                    location: {
                        lat,
                        lng,
                        name: placeName
                    },
                    caption: `Memory: ${file.replace(/\.[^/.]+$/, "")}`,
                    bbcHeadline: headline
                });

                // Add small deterministic delay to prevent overwhelming nominatim API if there are a lot of photos
                await new Promise(r => setTimeout(r, 1000));

            } catch (err) {
                console.error(`❌ Failed to parse ${file}:`, err.message);
            }
        }

        // Sort chronologically
        photosData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        await fs.writeFile(OUTPUT_FILE, JSON.stringify(photosData, null, 2));
        console.log(`✅ Successfully synced ${photosData.length} photos to photos.json`);

    } catch (error) {
        console.error('Fatal sync error:', error);
    }
}

processPhotos();
