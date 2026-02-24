import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            navigate('/');
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '2rem'
        }}>
            {/* Background Decor */}
            <div className="floating-circle" style={{ width: 400, height: 400, background: 'var(--color-primary)', top: '-10%', left: '-10%' }} />
            <div className="floating-circle" style={{ width: 300, height: 300, background: 'var(--color-secondary)', bottom: '10%', right: '-5%', animationDelay: '-5s' }} />

            <div className="glass animate-fade-in" style={{
                maxWidth: 420,
                width: '100%',
                padding: '3rem 2.5rem',
                textAlign: 'center',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.4)',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: 'var(--color-primary)'
                }}>
                    <Lock size={24} />
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                    Tessa's Memories
                </h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>
                    Enter the password to view our special moments.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <input
                            type="password"
                            className="input-base"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#E53E3E', fontSize: '0.875rem', marginTop: '-0.5rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Unlock Memories
                    </button>
                </form>
            </div>
        </div>
    );
};
