import axios from 'axios';



const AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscibers: (() => void)[] = [];

// Handle logout and prevent infinite loops
const handleLogout = () => {
  if (window.location.pathname === '/login') {
    window.location.href = '/login';
  }
};

// Handle adding a new access token to queued requests

const subscriberTokenRefresh = (callback: () => void) => {
  refreshSubscibers.push(callback);
};

// Ececute queued requests after refresh
const onRefreshSuccess = () => {
  refreshSubscibers.forEach((callback) => callback());
  refreshSubscibers = [];
};

// Handle API requests
AxiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Handle expired tokens and refresh login
AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // provent infinite retry loop
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscriberTokenRefresh(() => resolve(AxiosInstance(originalRequest)));
        });
      }
    }

    originalRequest._retry = true;
    isRefreshing = true;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/refresh-token`,
        {},
        { withCredentials: true }
      );

      isRefreshing = false;
      onRefreshSuccess();

      return AxiosInstance(originalRequest);
    } catch (error) {
      isRefreshing = false;
      refreshSubscibers = [];
      handleLogout();
    }
    return Promise.reject(error);
  }
);


export default AxiosInstance
