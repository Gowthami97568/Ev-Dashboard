const mysql = require("mysql2/promise");

const isTiDB = process.env.DB_HOST?.includes("tidbcloud.com");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Enable TLS only for TiDB Cloud
    ...(isTiDB && {
        ssl: {
            minVersion: "TLSv1.2"
        }
    }),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testDatabase() {
    try {
        const [dbRows] = await pool.query(
            "SELECT DATABASE() AS databaseName, USER() AS userName"
        );

        console.log("DATABASE CONNECTION:");
        console.log(dbRows[0]);

        const [tables] = await pool.query("SHOW TABLES");

        console.log("TABLES VISIBLE TO NODE:");
        console.table(tables);

    } catch (error) {
        console.error("DATABASE CONNECTION FAILED:", error.message);
    }
}

testDatabase();

module.exports = pool;