'use client';

import React, { useState, useEffect } from 'react';
import { getComments, addComment, type CommentType } from '../app/actions/comments';

const EMOJI_LIST = ['❤️', '🔥', '😂', '😍', '👍', '✨'];

export default function PhotoComments({ photoId }: { photoId: string }) {
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
        if (!text.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const res = await addComment(photoId, { type: 'comment', text: text.trim() });
        if (res.success && res.updated) {
            setComments(res.updated);
            setText('');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="photo-interaction-panel">
            <div className="reaction-bar">
                {EMOJI_LIST.map((emoji) => {
                    const count = reactions.filter(r => r.emoji === emoji).length;
                    return (
                        <button
                            key={emoji}
                            className={`reaction-btn ${count > 0 ? 'has-reactions' : ''}`}
                            onClick={() => handleReact(emoji)}
                            disabled={isSubmitting || loading}
                        >
                            <span className="emoji">{emoji}</span>
                            {count > 0 && <span className="count">{count}</span>}
                        </button>
                    );
                })}
            </div>

            <div className="comments-section">
                {loading ? (
                    <p className="loading-text">Loading activity...</p>
                ) : (
                    <div className="comments-list">
                        {textComments.length === 0 ? (
                            <p className="no-comments">No comments yet. Be the first!</p>
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
                        placeholder="Add a comment..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isSubmitting || loading}
                    />
                    <button type="submit" disabled={!text.trim() || isSubmitting || loading}>
                        Post
                    </button>
                </form>
            </div>
        </div>
    );
}
