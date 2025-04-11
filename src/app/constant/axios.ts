import { fetchAuthSession } from "@aws-amplify/auth";
import axios from "axios";
import { toast } from "sonner";
import { BASE_URL } from "./baseurl";

const instance = axios.create({
    baseURL: BASE_URL,
    //withCredentials: true,
});
const session = await fetchAuthSession();
  const authToken = session.tokens?.accessToken?.toString();

instance.interceptors.request.use(
    (config) => {
        const token = authToken;
        if (token) {
            config.headers.Authorization = token;
        }
        // Add any custom headers or configurations here   ;
        return config;
    },);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            console.error("Unauthorized access. Redirecting to login...");
            // Redirect to login page or perform any other action
        }
        toast.error("An error occurred: " + (error.response?.data?.message || "Unknown error"));
        console.error("Error:", error);    
        return Promise.reject(error);
    },
);

export default instance;