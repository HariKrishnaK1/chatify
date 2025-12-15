import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
};

// PORT = 3000
// MONGO_URI = mongodb+srv://harikrishnak5053_db_user:HiT5oAT1pIsnCIxz@cluster0.s3f0qly.mongodb.net/chatify_db?appName=Cluster0

// # NODE_ENV = production
// NODE_ENV = development

// JWT_SECRET = myjwtsecret

// RESEND_API_KEY = re_MnjYcMzD_CnMR8sypRc8uzyTncBpVTTRJ

// EMAIL_FROM = "onboarding@resend.dev"
// EMAIL_FROM_NAME = "Hari Krishna"

// CLIENT_URL=http://localhost:5173
