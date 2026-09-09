const express = require("express");
const cors = require("cors");
require("dotenv").config({ override: true });

const pool = require("./config/db");
const logRoutes = require("./routes/logRoutes");

// ======================================================
// IMPORT ROUTES
// ======================================================

const dashboardRoutes =
    require("./routes/dashboardRoutes");

const chargerRoutes =
    require("./routes/chargerRoutes");

const transactionRoutes =
    require("./routes/transactionRoutes");

const userRoutes =
    require("./routes/userRoutes");

const walletRoutes =
    require("./routes/walletRoutes");

const accountInfoRoutes =
    require("./routes/accountInfoRoutes");

const appVersionRoutes =
    require("./routes/appVersionRoutes");

const configDataRoutes =
    require("./routes/configDataRoutes");

const devicesMasterRoutes =
    require("./routes/devicesMasterRoutes");

const socketInfoRoutes =
    require("./routes/socketInfoRoutes");

const analyticsRoutes =
    require("./routes/analyticsRoutes");


// ======================================================
// CREATE APP
// ======================================================

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());

app.use("/api/logs", logRoutes);


// ======================================================
// ROOT
// ======================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message:
            "EV Dashboard Backend is running"
    });

});


// ======================================================
// DATABASE TEST
// ======================================================

app.get(
    "/api/test-db",
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    "SELECT 1 AS connected"
                );

            res.json({

                success: true,

                message:
                    "Database connected successfully",

                data: rows

            });

        } catch (error) {

            console.error(
                "❌ Database error:",
                error
            );
            
            res.status(500).json({
                success: false,
                message:
                    "Database connection failed",
                    error:
                    error.message

                });
            }
       }
    );


// ======================================================
// API ROUTES
// ======================================================

app.use(
    "/api/dashboard",
    dashboardRoutes
);


app.use(
    "/api/chargers",
    chargerRoutes
);


// ======================================================
// CHARGE TRANSACTIONS
// ======================================================
//
// IMPORTANT:
// Frontend uses:
//
// /api/charge-transactions
//
// So the backend must use the same base path.
//

app.use(
    "/api/charge-transactions",
    transactionRoutes
);


app.use(
    "/api/users",
    userRoutes
);


app.use(
    "/api/wallet",
    walletRoutes
);


app.use(
    "/api/account-info",
    accountInfoRoutes
);


app.use(
    "/api/app-version",
    appVersionRoutes
);


app.use(
    "/api/config-data",
    configDataRoutes
);


app.use(
    "/api/devices-master",
    devicesMasterRoutes
);


app.use(
    "/api/socket-info",
    socketInfoRoutes
);


app.use(
    "/api/analytics",
    analyticsRoutes
);


// ======================================================
// 404 HANDLER
// ======================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                `Route not found: ${req.method} ${req.originalUrl}`

        });

    }
);


// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "❌ Express error:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error",

            error:
                err.message

        });

    }
);


// ======================================================
// SERVER
// ======================================================

const PORT =
    process.env.PORT || 5000;


const server =
    app.listen(
        PORT,
        () => {

            console.log("");

            console.log(
                "======================================"
            );

            console.log(
                "🚀 EV Dashboard Backend Started"
            );

            console.log(
                "======================================"
            );


            console.log(
                `🌐 Server: http://localhost:${PORT}`
            );


            console.log(
                `📊 Dashboard: http://localhost:${PORT}/api/dashboard`
            );


            console.log(
                `🔌 Chargers: http://localhost:${PORT}/api/chargers`
            );


            console.log(
                `⚡ Transactions: http://localhost:${PORT}/api/charge-transactions`
            );


            console.log(
                `👤 Users: http://localhost:${PORT}/api/users`
            );


            console.log(
                `💰 Wallet: http://localhost:${PORT}/api/wallet`
            );


            console.log(
                `📋 Account Info: http://localhost:${PORT}/api/account-info`
            );


            console.log(
                `📱 App Versions: http://localhost:${PORT}/api/app-version`
            );


            console.log(
                `⚙️ Config Data: http://localhost:${PORT}/api/config-data`
            );


            console.log(
                `🔌 Devices Master: http://localhost:${PORT}/api/devices-master`
            );


            console.log(
                `📡 Socket Info: http://localhost:${PORT}/api/socket-info`
            );


            console.log(
                `📈 Analytics: http://localhost:${PORT}/api/analytics`
            );


            console.log(
                `🗄️ DB Test: http://localhost:${PORT}/api/test-db`
            );


            console.log(
                "======================================"
            );

            console.log("");


            console.log(
                "DB_HOST:",
                process.env.DB_HOST
            );


            console.log(
                "DB_PORT:",
                process.env.DB_PORT
            );


            console.log(
                "DB_USER:",
                process.env.DB_USER
            );


            console.log(
                "DB_NAME:",
                process.env.DB_NAME
            );


            console.log(
                "DB_PASSWORD exists:",
                !!process.env.DB_PASSWORD
            );


            console.log("");

        }
    );


// ======================================================
// SERVER ERROR
// ======================================================

server.on(
    "error",
    (error) => {

        console.error("");

        console.error(
            "======================================"
        );

        console.error(
            "❌ SERVER STARTUP ERROR"
        );

        console.error(
            "======================================"
        );

        console.error(error);

        console.error(
            "======================================"
        );


        if (
            error.code === "EADDRINUSE"
        ) {

            console.error(

                `❌ Port ${PORT} is already being used by another process.`

            );

        }

    }
);