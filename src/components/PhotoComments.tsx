'use client';

import React, { useState, useEffect } from 'react';
import { getComments, addComment, type CommentType } from '../app/actions/comments';

const EMOJI_LIST = ['❤️', '🔥', '😂', '😍', '👍', '✨'];

// Simple cross-instance client-side cache to survive modal unmounts
const localCommentsCache: Record<string, CommentType[]> = {};

interface PhotoCommentsProps {
    photoId: string;
    isFeed?: boolean;
    onCommentsClick?: () => void;
}

export default function PhotoComments({ photoId, isFeed = false, onCommentsClick }: PhotoCommentsProps) {
    // Initialize with cached comments if available to avoid flicker/stale data
    const [comments, setComments] = useState<CommentType[]>(() => localCommentsCache[photoId] || []);
    const [loading, setLoading] = useState(!localCommentsCache[photoId]);
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem('tessa_visitor_name');
        if (storedName) setName(storedName);
    }, []);

    const handleNameChange = (newName: string) => {
        setName(newName);
        localStorage.setItem('tessa_visitor_name', newName);
    };

    useEffect(() => {
        let active = true;
        setLoading(!localCommentsCache[photoId]);
        getComments(photoId)
            .then((res) => {
                if (active) {
                    const fetched = res || [];
                    // Simple approach: if our local cache has MORE comments, we might have just added one
                    // and KV is eventually consistent. Prefer local cache if it is larger.
                    if (!localCommentsCache[photoId] || fetched.length >= localCommentsCache[photoId].length) {
                        localCommentsCache[photoId] = fetched;
                        setComments(fetched);
                    }
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error('Action failed:', err);
                if (active) {
                    setLoading(false);
                }
            });
        return () => { active = false; };
    }, [photoId]);

    const reactions = comments.filter(c => c.type === 'reaction');
    const textComments = comments.filter(c => c.type === 'comment');

    // Synchronize comments across instances for the same photo
    useEffect(() => {
        const handleUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail.photoId === photoId) {
                localCommentsCache[photoId] = customEvent.detail.comments;
                setComments(customEvent.detail.comments);
            }
        };
        window.addEventListener('photo-comments-updated', handleUpdate);
        return () => window.removeEventListener('photo-comments-updated', handleUpdate);
    }, [photoId]);

    const handleReact = async (emoji: string) => {
        let currentName = name;
        if (!currentName) {
            const promptName = window.prompt("Please enter your name to react:");
            if (!promptName || !promptName.trim()) return;
            currentName = promptName.trim();
            handleNameChange(currentName);
        }

        setIsSubmitting(true);
        const res = await addComment(photoId, { type: 'reaction', emoji, name: currentName });
        if (res.success && res.updated) {
            localCommentsCache[photoId] = res.updated;
            setComments(res.updated);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('photo-comments-updated', {
                    detail: { photoId, comments: res.updated }
                }));
            }
        }
        setIsSubmitting(false);
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!text.trim() || isSubmitting) return;

        let currentName = name;
        if (!currentName) {
            const promptName = window.prompt("Please enter your name to post a thought:");
            if (!promptName || !promptName.trim()) return;
            currentName = promptName.trim();
            handleNameChange(currentName);
        }

        setIsSubmitting(true);
        const res = await addComment(photoId, { type: 'comment', text: text.trim(), name: currentName });
        if (res.success && res.updated) {
            localCommentsCache[photoId] = res.updated;
            setComments(res.updated);
            setText('');
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('photo-comments-updated', {
                    detail: { photoId, comments: res.updated }
                }));
            }
        }
        setIsSubmitting(false);
    };

    const totalThoughts = textComments.length;
    const activeReactions = EMOJI_LIST.map(emoji => ({
        emoji,
        count: reactions.filter(r => r.emoji === emoji).length,
        reacts: reactions.filter(r => r.emoji === emoji)
    })).filter(r => r.count > 0);

    const activeEmojiTypes = activeReactions.map(r => r.emoji);

    // In feed mode, we may want to show the emoji picker only on hover or explicitly open it
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const showAll = !isFeed || isHovered || isExpanded;

    const handleReactWithClose = (emoji: string) => {
        handleReact(emoji);
        setIsExpanded(false);
    };

    return (
        <div
            className={`photo-interaction-panel ${isFeed ? 'feed-mode' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); }}
        >
            <div className="reaction-summary-bar">
                {/* Active reactions always visible */}
                <div className="active-reactions">
                    {(showAll ? EMOJI_LIST.map(e => ({ emoji: e, count: reactions.filter(r => r.emoji === e).length, reacts: reactions.filter(r => r.emoji === e) })) : activeReactions).map((r) => {
                        const title = r.reacts?.filter(rx => rx.name).map(rx => rx.name).join(', ');
                        return (
                        <button
                            key={r.emoji}
                            className={`reaction-btn ${r.count > 0 ? 'has-reactions' : ''}`}
                            onClick={() => handleReactWithClose(r.emoji)}
                            disabled={isSubmitting || loading}
                            title={title || ''}
                        >
                            <span className="emoji">{r.emoji}</span>
                            {r.count > 0 && <span className="count">{r.count}</span>}
                        </button>
                    )})}

                    {/* The + picker trigger on feed mode */}
                    {isFeed && activeEmojiTypes.length < EMOJI_LIST.length && (
                        <button
                            className="reaction-btn hover-trigger"
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        >
                            <span style={{ fontSize: '1.2rem', lineHeight: 1, color: 'var(--text-color)', opacity: 0.7 }}>
                                {showAll ? '×' : '+'}
                            </span>
                        </button>
                    )}
                </div>

                {isFeed && (
                    <button
                        className="feed-thoughts-counter"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onCommentsClick) onCommentsClick();
                        }}
                    >
                        <span className="emoji">💬</span> {totalThoughts} {totalThoughts === 1 ? 'thought' : 'thoughts'}
                    </button>
                )}
            </div>

            {/* In feed mode, we hide the comment list completely unless you want them visible. The prompt says "show no. of comments and give an icon to allow a user to leave a comment", "dont call them comments". Let's assume clicking the thoughts counter pushes to the modal, but if the full form is required, we can show a small input. Let's hide the list and just show input or trigger. */}

            {!isFeed && (
                <div className="comments-section">
                    {loading ? (
                        <p className="loading-text">Loading...</p>
                    ) : (
                        <div className="comments-list">
                            {textComments.length === 0 ? (
                                <p className="no-comments">No thoughts yet. Be the first!</p>
                            ) : (
                                textComments.map(c => (
                                    <div key={c.id} className="comment-bubble">
                                        {c.name && <span className="comment-name" style={{ fontWeight: 600, fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>{c.name}</span>}
                                        <p className="comment-text">{c.text}</p>
                                        <span className="comment-date">
                                            {new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    <form className="comment-form" onSubmit={handleComment}>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            disabled={isSubmitting || loading}
                            style={{ maxWidth: '120px' }}
                        />
                        <input
                            type="text"
                            placeholder="Add your thoughts..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={isSubmitting || loading}
                        />
                        <button type="submit" disabled={!text.trim() || isSubmitting || loading}>
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
