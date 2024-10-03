import { useState, useEffect } from 'react';
import { User } from '@/lib/db/schema';

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch('/api/user');
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUser();
    }, []);

    return { user, isLoading };
}
