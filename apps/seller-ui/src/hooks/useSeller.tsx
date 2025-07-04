"use client"

import { useQuery } from "@tanstack/react-query"
import AxiosInstance from "../utils/axiosIntance";

const fetchSeller = async () => {
    try {
        const response = await AxiosInstance.get("/api/logged-in-seller");
        return response.data.sellers;
    } catch (error: any) {
        throw error;
    }
}

export const useSeller = () => {
    const { data: seller, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["seller"],
        queryFn: fetchSeller,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return { seller, isLoading, isError, error, refetch };
}
