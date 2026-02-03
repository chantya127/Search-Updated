import dotenv from "dotenv";
import process from "process";

dotenv.config();

function getEnv(key, defaultValue = null) {
    const value = process.env[key];

    if (value === undefined || value === '') {
        if (defaultValue !== null) return defaultValue;
        throw new Error(`Missing env value for variable ${key}`);
    }
    return value;

}


const config = {
    PORT: Number(getEnv('PORT')),
    UNBXD_SEARCH_BASE_URL: getEnv('UNBXD_SEARCH_BASE_URL'),
    UNBXD_SEARCH_API_KEY: getEnv('UNBXD_SEARCH_API_KEY'),
    UNBXD_SEARCH_SITE_KEY: getEnv('UNBXD_SEARCH_SITE_KEY')
}

export default config;