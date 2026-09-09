const pool = require("../config/db");
/**
 * Existing summary counts — unchanged.
 */
const getDashboard = async (req, res) => {
    try {
        const queries = [
            ["chargerman", "chargers"],
            ["chargertransaction", "transactions"],
            ["evusers", "users"],
            ["accountinfo", "accountInfo"],
            ["appversion", "appVersions"],
            ["wallethistory", "walletHistory"],
            ["config_data", "configData"],
            ["devices_master", "devices"]
        ];

        const result = {};

        for (const [table, key] of queries) {
            try {
                const [rows] = await pool.query(
                    `SELECT COUNT(*) AS count FROM ${table}`
                );

                result[key] = rows[0].count;
            } catch (error) {
                result[key] = 0;
            }
        }

        res.json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: result
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message
        });
    }
};

/**
 * NEW: Chart-ready data for the dashboard visualizations.
 *
 * ASSUMPTION: this assumes `chargertransaction` and `evusers` each have a
 * `created_at` (or similar) timestamp column. If your column is named
 * differently (e.g. `createdAt`, `txn_date`, `reg_date`), update the
 * column names below. If the column doesn't exist at all, each query is
 * wrapped in its own try/catch so it silently returns an empty array
 * instead of breaking the whole endpoint — the frontend hides that chart
 * when its data is empty.
 */
const getDashboardTrends = async (req, res) => {
    const result = {
        transactionsLast7Days: [],
        usersLast6Months: []
    };

    // Daily transaction count, last 7 days
    try {
        const [rows] = await pool.query(
            `SELECT DATE(created_at) AS day, COUNT(*) AS count
             FROM chargertransaction
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
             GROUP BY DATE(created_at)
             ORDER BY day ASC`
        );
        result.transactionsLast7Days = rows;
    } catch (error) {
        // Column/table not shaped as assumed — degrade gracefully
        result.transactionsLast7Days = [];
    }

    // New user signups, last 6 months
    try {
        const [rows] = await pool.query(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
             FROM evusers
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY DATE_FORMAT(created_at, '%Y-%m')
             ORDER BY month ASC`
        );
        result.usersLast6Months = rows;
    } catch (error) {
        result.usersLast6Months = [];
    }

    res.json({
        success: true,
        message: "Dashboard trend data fetched successfully",
        data: result
    });
};

module.exports = {
    getDashboard,
    getDashboardTrends
};