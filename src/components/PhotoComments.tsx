'use client';

import React, { useState, useEffect } from 'react';
import { getComments, addComment, type CommentType } from '../app/actions/comments';

const EMOJI_LIST = ['❤️', '🔥', '😂', '😍', '👍', '✨'];

export default function PhotoComments({ photoId, isFeed = false }: { photoId: string, isFeed?: boolean }) {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getComments(photoId).then((res) => {
            if (active) {
                setComments(res);
                setLoading(false);
            }
        });
        return () => { active = false; };
    }, [photoId]);

    const reactions = comments.filter(c => c.type === 'reaction');
    const textComments = comments.filter(c => c.type === 'comment');

    const handleReact = async (emoji: string) => {
        setIsSubmitting(true);
        const res = await addComment(photoId, { type: 'reaction', emoji });
        if (res.success && res.updated) setComments(res.updated);
        setIsSubmitting(false);
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!text.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const res = await addComment(photoId, { type: 'comment', text: text.trim() });
        if (res.success && res.updated) {
            setComments(res.updated);
            setText('');
        }
        setIsSubmitting(false);
    };

    const totalThoughts = textComments.length;
    const activeReactions = EMOJI_LIST.map(emoji => ({
        emoji,
        count: reactions.filter(r => r.emoji === emoji).length
    })).filter(r => r.count > 0);

    const activeEmojiTypes = activeReactions.map(r => r.emoji);

    // In feed mode, we may want to show the emoji picker only on hover
    const [pickerVisible, setPickerVisible] = useState(false);

    return (
        <div
            className={`photo-interaction-panel ${isFeed ? 'feed-mode' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setPickerVisible(true)}
            onMouseLeave={() => setPickerVisible(false)}
        >
            <div className="reaction-summary-bar">
                {/* Active reactions always visible */}
                <div className="active-reactions">
                    {(isFeed && !pickerVisible ? activeReactions : EMOJI_LIST.map(e => ({ emoji: e, count: reactions.filter(r => r.emoji === e).length }))).map((r) => (
                        <button
                            key={r.emoji}
                            className={`reaction-btn ${r.count > 0 ? 'has-reactions' : ''}`}
                            onClick={() => handleReact(r.emoji)}
                            disabled={isSubmitting || loading}
                        >
                            <span className="emoji">{r.emoji}</span>
                            {r.count > 0 && <span className="count">{r.count}</span>}
                        </button>
                    ))}

                    {/* The + picker trigger on feed mode */}
                    {isFeed && !pickerVisible && (
                        <button
                            className="reaction-btn hover-trigger"
                            onClick={(e) => { e.stopPropagation(); setPickerVisible(true); }}
                        >
                            <span className="emoji">➕</span>
                        </button>
                    )}
                </div>

                {isFeed && (
                    <div className="feed-thoughts-counter">
                        <span className="emoji">💬</span> {totalThoughts} {totalThoughts === 1 ? 'thought' : 'thoughts'}
                    </div>
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
