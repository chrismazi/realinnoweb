export const translations = {
    en: {
        common: {
            dashboard: "Dashboard",
            budget: "Budget",
            wellness: "Wellness",
            learn: "Learn",
            profile: "Profile",
            analytics: "Analytics",
            settings: "Settings",
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            back: "Back",
            next: "Next",
            loading: "Loading...",
            error: "Error",
            success: "Success",
            seeAll: "See All",
            today: "Today",
            overdraft: "Overdraft",
            health: "Health",
            chat: "Chat",
            plan: "Plan"
        },
        auth: {
            login: "Sign In",
            signup: "Sign Up",
            email: "Email Address",
            password: "Password",
            name: "Full Name",
            financialHealth: "Ubuzima bw'Imari",
            viewAll: "Reba Byose",
            noTransactions: "Nta biheruka gukorwa",
            quickActions: "Ibikorwa byihuse",
            addTransaction: "Ongeraho",
            checkMood: "Isuzume",
            dailyPulse: "Uyu munsi",
            dailySpend: "Ayo wakoresheje",
            upNext: "Ibikurikira",
            add: "Ongeraho",
            send: "Ohereza",
            scan: "Sikana",
            more: "Ibindi",
            savingsGoals: "Intego zo kuzigama"
        },
        budget: {
            title: "Ingengo y'Imari",
            addTransaction: "Ongeraho",
            addRecurring: "Ongeraho Ihoraho",
            categories: "Ibyiciro",
            monthlyBudget: "Ingengo y'ukwezi",
            spent: "Ayakoreshejwe",
            remaining: "Asigaye",
            transactionHistory: "Amateka y'ibyakozwe",
            noTransactions: "Nta byakozwe birimo",
            income: "Ayinjiye",
            expense: "Ayasohotse",
            amount: "Umubare",
            category: "Icyiciro",
            date: "Itariki",
            description: "Ubusobanuro"
        },
        wellness: {
            title: "Ikigo cy'Ubuzima",
            mentalHealth: "Ubuzima bwo mu mutwe",
            cycleTracking: "Gukurikirana imihango",
            chatWithVestie: "Ganira na Vestie",
            dailyCheckin: "Isuzuma rya buri munsi",
            moodTracker: "Ibyiyumviro",
            howAreYou: "Urimo kwiyumva ute uyu munsi?",
            periodTracker: "Gukurikirana Imihango",
            nextPeriod: "Imihango itaha",
            fertileWindow: "Igihe cy'uburumbuke",
            days: "iminsi",
            logPeriod: "Andika Imihango",
            symptoms: "Ibimenyetso"
        },
        learn: {
            title: "Inyigisho z'Imari",
            courses: "Amasomo",
            articles: "Inyandiko",
            readMore: "Soma ibindi",
            startCourse: "Tangira Isomo"
        },
        profile: {
            account: "Konti",
            preferences: "Ibyo uhitamo",
            darkMode: "Inyuma Hirabura",
            notifications: "Amenyesha",
            language: "Ururimi",
            currency: "Ifaranga",
            logout: "Sohoka",
            personalInfo: "Umwirondoro wanjye",
            exportData: "Bika amakuru",
            help: "Ubufasha",
            privacy: "Amategeko y'ibanga"
        }
    }
};

export type Language = 'en' | 'rw';
export type TranslationKey = keyof typeof translations.en;
