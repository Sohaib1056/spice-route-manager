import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  mongoUri: string;
  nodeEnv: string;
  bcryptSaltRounds: number;
  auditLogRetentionDays: number;
}

const config: Config = {
  port: parseInt(process.env.PORT || "8080", 10),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/spice-route",
  nodeEnv: process.env.NODE_ENV || "development",
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || "90", 10),
};

export default config;
