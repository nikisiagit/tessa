export interface Photo {
    id: string;
    url: string;
    date: Date;
    width: number;
    height: number;
}

export async function getPhotos(streamId: string): Promise<Record<number, Photo[]>> {
    let url = `https://p01-sharedstreams.icloud.com/${streamId}/sharedstreams/webstream`;
    let res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ streamCtag: null }),
        cache: 'no-store'
    });

    if (!res.ok && res.status !== 330) {
        throw new Error('Failed to fetch iCloud partition');
    }

    let data = await res.json();
    let host = data['X-Apple-MMe-Host'];

    if (host) {
        url = `https://${host}/${streamId}/sharedstreams/webstream`;
        res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ streamCtag: null }),
            cache: 'no-store'
        });
        if (!res.ok) {
            throw new Error('Failed to fetch iCloud photos stream');
        }
        data = await res.json();
    }

    const photos = data.photos || [];
    if (photos.length === 0) return {};

    const photoGuids = photos.map((p: any) => p.photoGuid);

    // Step 2: get asset urls
    const assetUrl = `https://${host}/${streamId}/sharedstreams/webasseturls`;
    const assetRes = await fetch(assetUrl, {
        method: 'POST',
        body: JSON.stringify({ photoGuids }),
        cache: 'no-store'
    });
    if (!assetRes.ok) throw new Error('Failed to fetch iCloud asset URLs');

    const assetData = await assetRes.json();
    const parsedPhotos: Photo[] = [];

    for (const p of photos) {
        // find max derivative
        const dKeys = Object.keys(p.derivatives);
        if (dKeys.length === 0) continue;

        let maxD = p.derivatives[dKeys[0]];
        for (const k of dKeys) {
            if (parseInt(p.derivatives[k].width) > parseInt(maxD.width)) {
                maxD = p.derivatives[k];
            }
        }

        const checksum = maxD.checksum;
        const item = assetData.items[checksum];
        if (!item) continue;

        const location = assetData.locations[item.url_location];
        const scheme = location.scheme;
        const hostUrl = location.hosts[0];
        const downloadUrl = `${scheme}://${hostUrl}${item.url_path}`;

        parsedPhotos.push({
            id: p.photoGuid,
            url: downloadUrl,
            date: new Date(p.dateCreated),
            width: parseInt(maxD.width),
            height: parseInt(maxD.height),
        });
    }

    // Sort photos conceptually from oldest to newest
    parsedPhotos.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Group by year
    const grouped: Record<number, Photo[]> = {};
    for (const photo of parsedPhotos) {
        const year = photo.date.getFullYear();
        if (!grouped[year]) {
            grouped[year] = [];
        }
        grouped[year].push(photo);
    }

    return grouped;
}
