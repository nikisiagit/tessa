import { getPhotos } from './src/lib/icloud.js';

const streamId = 'B2BGY8gBYIzSAT';
getPhotos(streamId).then(data => {
    console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
