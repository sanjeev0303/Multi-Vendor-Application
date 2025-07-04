import axios from 'axios';

const AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080',
    withCredentials: true,
});

let isRefreshing = false;
let refreshSubscibers: ((token?: string) => void)[] = [];

const handleLogout = () => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

const subscriberTokenRefresh = (callback: () => void) => {
    refreshSubscibers.push(callback);
};

const onRefreshSuccess = () => {
    refreshSubscibers.forEach((callback) => callback());
    refreshSubscibers = [];
};

AxiosInstance.interceptors.request.use(
    (config) => {
        config.withCredentials = true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

AxiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (!error.response) {
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscriberTokenRefresh(() => resolve(AxiosInstance(originalRequest)));
                });
            }

            isRefreshing = true;
            try {
                const refreshUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080'}/api/refresh-token`;

                await axios.post(
                    refreshUrl,
                    {},
                    { withCredentials: true }
                );

                isRefreshing = false;
                onRefreshSuccess();
                
                return AxiosInstance(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscibers = [];
                handleLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default AxiosInstance;
