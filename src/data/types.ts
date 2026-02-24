export interface PhotoData {
    id: string;
    url: string;
    date: string; // ISO date string
    location: {
        lat: number;
        lng: number;
        name?: string;
    };
    caption: string;
    bbcHeadline?: string;
}
