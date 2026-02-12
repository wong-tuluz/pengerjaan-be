export type TokenStore = {
    access_token: string,
    refresh_token: string
}

export const config = {
    url: process.env.LMS_BO_URL,
    key: process.env.LMS_BO_KEY,
    id: process.env.LMS_BO_ID,
}

export const KEY = `bo_session_${config.id}`

