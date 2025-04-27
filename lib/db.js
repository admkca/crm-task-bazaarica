import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 24972, // Portu da ekliyoruz
  waitForConnections: true,
  connectionLimit: 10, // aynı anda max 10 bağlantı
  queueLimit: 0, // sınırsız kuyruk
});
