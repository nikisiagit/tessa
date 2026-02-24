'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
    const password = formData.get('password')
    const expectedPassword = process.env.SITE_PASSWORD || 'tessa2026'

    if (password === expectedPassword) {
        const cookieStore = await cookies()
        cookieStore.set('tessa-auth', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: '/'
        })
        redirect('/')
    }

    return { error: 'Incorrect password' }
}
