import axiosInstance from "../utils/axiosInstance"

export const createShortUrl = async (url, slug, options = {}) =>{
    const payload = { url, slug, ...options }
    const {data} = await axiosInstance.post("/api/create", payload)
    return data.shortUrl
}
