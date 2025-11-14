export const cookieOptions = {
    httpOnly: true,
    secure: process.env.FRONTEND_ORIGIN?.startsWith('https://') ? true : false,
    sameSite: process.env.FRONTEND_ORIGIN?.includes('localhost') ? "Lax" : "None",
    maxAge: 1000 * 60 * 60, // 5 minutes
}