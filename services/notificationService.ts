import { supabase } from '../lib/supabase';

export const notificationService = {
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            await this.registerServiceWorker();
            return true;
        }
        return false;
    },

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered with scope:', registration.scope);
                return registration;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    },

    // This would be used to send the subscription object to the backend
    async subscribeToPush() {
        const registration = await navigator.serviceWorker.ready;
        // Note: You need a VAPID public key from your backend/provider
        // const subscription = await registration.pushManager.subscribe({
        //     userVisibleOnly: true,
        //     applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        // });
        // await this.saveSubscription(subscription);
    },

    async saveSubscription(subscription: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Store subscription in profiles or a separate table
            // await supabase.from('profiles').update({ push_subscription: subscription }).eq('id', user.id);
        }
    }
};
