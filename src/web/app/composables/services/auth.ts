import { laraFetch } from "lara-fetch";
import { useUserStore, type User } from "~/stores/dash.user";

export const fetchAuthUser = async () => {
    const adoFetch = useAdoFetch();
    const userStore = useUserStore();
    userStore.loading = true;
    try {
        const response = await adoFetch.get('/auth/user');
        const data = await response.json();
        if(response.ok){
            return data as User;
        }else{
            if(response.status === 401){
                return 401; // Unauthorized
            }else{
                return 'error';
            }
            // throw new Error(data.message || 'Failed to fetch user');
        }
    } catch (err) {
        return 'net-error'
    }finally{
        userStore.loading = false;
    }
}