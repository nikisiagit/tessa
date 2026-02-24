'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions'

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, { error: '' })

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Private Album</h1>
                <p>Please enter the password to view this collection.</p>

                <form action={formAction}>
                    <div className="input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            autoFocus
                        />
                    </div>
                    <button type="submit" disabled={isPending}>
                        {isPending ? 'Unlocking...' : 'Unlock Memories'}
                    </button>

                    {state?.error && (
                        <p className="error-message">{state.error}</p>
                    )}
                </form>
            </div>
        </div>
    )
}
