const express = require("express");
const router = express.Router();

const pool = require("../config/db");

// ======================================================
// GET DASHBOARD SUMMARY
// ======================================================

router.get("/", async (req, res) => {
    try {

        const query = `
            SELECT
                (SELECT COUNT(*) FROM chargeman) AS chargers,
                (SELECT COUNT(*) FROM chargetransaction) AS transactions,
                (SELECT COUNT(*) FROM evusers) AS users,
                (SELECT COUNT(*) FROM accountinfo) AS accountInfo,
                (SELECT COUNT(*) FROM appversion) AS appVersions,
                (SELECT COUNT(*) FROM wallethistory) AS walletHistory,
                (SELECT COUNT(*) FROM config_data) AS configData,
                                (SELECT COUNT(*) FROM devices_master) AS devices,
                                (SELECT COUNT(*)
                                 FROM chargetransaction
                                 WHERE deviceid IS NOT NULL
                                     AND deviceid <> ''
                                     AND starttime IS NOT NULL) AS logs
        `;

        const [rows] = await pool.query(query);

        const row = rows[0];

        res.json({
            success: true,
            message: "Dashboard data fetched successfully",

            data: {
                chargers: Number(row.chargers || 0),
                transactions: Number(row.transactions || 0),
                users: Number(row.users || 0),
                accountInfo: Number(row.accountInfo || 0),
                appVersions: Number(row.appVersions || 0),
                walletHistory: Number(row.walletHistory || 0),
                configData: Number(row.configData || 0),
                devices: Number(row.devices || 0),
                logs: Number(row.logs || 0)
            }
        });

    } catch (error) {

        console.error(
            "❌ Dashboard Summary Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message
        });
    }
});


// ======================================================
// GET DASHBOARD TRENDS
// ======================================================

router.get("/trends", async (req, res) => {
    try {

        // --------------------------------------------------
        // TRANSACTIONS
        // Your actual table:
        // chargetransaction
        //
        // Your actual date field:
        // createddate
        // --------------------------------------------------

        const transactionsQuery = `
            SELECT
                DATE(createddate) AS day,
                COUNT(*) AS count
            FROM chargetransaction
            WHERE createddate IS NOT NULL
            GROUP BY DATE(createddate)
            ORDER BY day DESC
            LIMIT 7
        `;


        const [transactionRows] =
            await pool.query(transactionsQuery);


        const transactionsLast7Days =
            [...transactionRows]
                .reverse()
                .map(row => ({
                    day: row.day,
                    count: Number(row.count || 0)
                }));


        // --------------------------------------------------
        // USERS
        //
        // Do NOT query evusers.createddate because the
        // evusers schema you showed does not contain it.
        //
        // Keep this empty until we choose a real user
        // date column from your schema.
        // --------------------------------------------------

        const usersLast6Months = [];


        console.log(
            "✅ Dashboard Transactions Trend:",
            transactionsLast7Days
        );


        res.json({
            success: true,

            message:
                "Dashboard trends fetched successfully",

            data: {
                transactionsLast7Days,
                usersLast6Months
            }
        });

    } catch (error) {

        console.error(
            "❌ Dashboard Trends Error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to fetch dashboard trends",

            error: error.message
        });
    }
});


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;