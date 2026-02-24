import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  ZEPTO_API_KEY: process.env.ZEPTO_API_KEY,
  FROM_EMAIL: process.env.ZEPTO_FROM_EMAIL
};
