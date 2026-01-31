export interface User{
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phone: string;
    avatar?: string;
    profile: 'super' | 'staff' | 'client';
    isActive: boolean;
    citizenship?: string;
    emailVerifiedAt: string | null;
    idType?: string;
    idValue?: string;
    idUrl?: string;
    dob?: string;
}

export const useUserStore = defineStore('dash-user', ()=>{
    const user = ref<User | null>(null);
    const lastCheckedAt = ref<number | null>(null)
    const loading = ref(false);

    function setUser(userData: User){
        if(user.value?.email && user.value.email !== userData.email){
            window.location.reload()
        }
        user.value = userData;
        lastCheckedAt.value = Date.now();
        loading.value = false;
    }

    function clearUser(){
        user.value = null;
        lastCheckedAt.value = null;
        loading.value = false;
    }

    return {
        user,
        setUser,
        clearUser,
        lastCheckedAt,
        loading,
    };
})