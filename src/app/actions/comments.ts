'use server';

import { getCloudflareContext } from '@opennextjs/cloudflare';

export type CommentType = {
    id: string;
    type: 'comment' | 'reaction';
    text?: string;
    emoji?: string;
    date: string;
};

export async function getComments(photoId: string): Promise<CommentType[]> {
    try {
        const { env } = getCloudflareContext() as any;
        if (!env || !env.COMMENTS) return [];

        const raw = await env.COMMENTS.get(`photo:${photoId}`);
        if (!raw) return [];
        return JSON.parse(raw) as CommentType[];
    } catch (e) {
        console.error('Failed to get comments', e);
        return [];
    }
}

export async function addComment(photoId: string, payload: Omit<CommentType, 'id' | 'date'>) {
    try {
        const { env } = getCloudflareContext() as any;
        if (!env || !env.COMMENTS) return { success: false, error: 'KV not configured' };

        const current = await getComments(photoId);

        const newEntry: CommentType = {
            ...payload,
            id: Math.random().toString(36).substring(2, 9),
            date: new Date().toISOString()
        };

        current.push(newEntry);

        await env.COMMENTS.put(`photo:${photoId}`, JSON.stringify(current));
        return { success: true, updated: current };
    } catch (e) {
        console.error('Failed to add comment', e);
        return { success: false, error: 'Database error' };
    }
}
