import { useAuth } from '../db';

export function useOwnerId() {
    const { user } = useAuth();
    return () => user()?.id ?? '';
}
