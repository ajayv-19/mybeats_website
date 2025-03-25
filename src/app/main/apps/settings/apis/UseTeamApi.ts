// import axios from "@/constants/axios";
// import { useQuery } from "@tanstack/react-query";

// export const useGetFavourites = (folderId: string) => {
//     const query = useQuery({
//         queryKey: ["favourites", folderId],
//         queryFn: async () => {
//             const response = await axios.get(`/api/ex/folders/getFolderById/${folderId}`)
//             if (response.status !== 200) {
//                 throw new Error("Failed to fetch favourites data");
//             }
//             const { data } = response;
//             return data;
//         },
//         enabled: !!folderId
//     })
//     return query;
// }



// import { toast } from "sonner";
// import axios from "@/constants/axios";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

// export const useChangePassword = () => {
//     const navigate = useNavigate()
//     const queryClient = useQueryClient();

//     const mutation = useMutation<any, Error, { token: string, password: string }>({
//         mutationFn: async (json: { token: string, password: string }) => {
//             const response = await axios.post("/api/ex/auth/password/change", json);
//             if (response.status !== 200) {
//                 throw new Error("Token expired");
//             }
//             return response.data; // Assumes `axios` returns the data directly
//         },
//         onSuccess: () => {
//             // Success handler
//             toast.success("Password changed successfully!");
//             navigate("/sign-in", { replace: true });
//             queryClient.invalidateQueries({ queryKey: ["forgot-password-verification"] });
//         },
//         onError: () => {
//             // Error handler
//             toast.error("Token expired");
//         },
//     });

//     return mutation;
// };

