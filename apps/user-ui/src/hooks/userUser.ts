import { useQuery } from "@tanstack/react-query"
import AxiosInstance from "../utils/axiosInstance"


// fetch user data from API
const fetchUser = async () => {
const response = await AxiosInstance.get("/api/logged-in-user")
return response.data.user;
}


export const useUser = () => {
    const { data:user, isLoading, isError, refetch} = useQuery({
        queryKey: ["user"],
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })

    return { user, isLoading, isError, refetch }
}
