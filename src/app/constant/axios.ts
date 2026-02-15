import { fetchAuthSession } from "@aws-amplify/auth";
import axios from "axios";
import { toast } from "sonner";
import { BASE_URL } from "./baseurl";

const instance = axios.create({
    baseURL: BASE_URL,
    //withCredentials: true,
});
const getAuth = async()=>((await fetchAuthSession()).tokens?.accessToken?.toString());

instance.interceptors.request.use(
    async (config) => {
        const token = await getAuth();
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
        if (error.response) {
            const { status, data } = error.response;

            // Handle unauthorized access
            if (status === 401) {
                console.error("Unauthorized access. Redirecting to login...");
                // Redirect to login page or perform any other action
            }

            // Extract and display the error message (API may use data.message or data.error.message)
            const errorMessage = data?.message || data?.error?.message || "An unknown error occurred.";
            console.error("Error:", errorMessage);
            // 400 = validation/business rule (e.g. duplicate approval) → show as warning notification
            if (status === 400) {
                toast.warning(errorMessage);
            } else {
                toast.error(errorMessage);
            }
        } else {
            // Handle network or unknown errors
            toast.error("A network error occurred. Please try again.");
        }

        console.error("Error:", error);
        return Promise.reject(error);
    }
);

export default instance;