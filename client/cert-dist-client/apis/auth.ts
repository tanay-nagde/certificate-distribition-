import axios from 'axios';
const LOCAL_AUTH_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: LOCAL_AUTH_URL, // your hono backend
  withCredentials: true,            // 👈 VERY important
});

export async function login(email: string, password: string) {
    const response = await api.post(`/login`, {
        email,
        password
    });

    if (response.status !== 200) {
        throw new Error("Login failed");
    }

    return response.data;
}

export const getme = async ()=>{
try {
    const response = await api.get("/me")
    return response.data
} catch (error) {
    return null
    
}
}
 

