const pool = require("../config/db");

// ======================================================
// KEY INSIGHTS
// ======================================================

const getInsights = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                COUNT(*) AS transactions,

                COALESCE(AVG(NULLIF(kwh, -1)), 0)
                    AS average_kwh,

                COALESCE(AVG(NULLIF(duration, -1)), 0)
                    AS average_duration,

                COALESCE(AVG(NULLIF(watt, -1)), 0)
                    AS average_watt,

                COALESCE(
                    AVG(
                        CASE
                            WHEN autostart = 1 THEN 1
                            ELSE 0
                        END
                    ) * 100,
                    0
                ) AS autostart_rate,

                COALESCE(SUM(kwh), 0)
                    AS total_kwh,

                COALESCE(SUM(chargevalue), 0)
                    AS total_charge_value

            FROM chargetransaction
        `);

        const row = rows[0] || {};

        res.json({
            success: true,
            message: "Analytics insights fetched successfully",
            data: {
                transactions: Number(row.transactions || 0),
                averageKwh: Number(row.average_kwh || 0),
                averageDuration: Number(row.average_duration || 0),
                averageWatt: Number(row.average_watt || 0),
                autostartRate: Number(row.autostart_rate || 0),
                totalKwh: Number(row.total_kwh || 0),
                totalChargeValue: Number(
                    row.total_charge_value || 0
                )
            }
        });

    } catch (error) {
        console.error("❌ Analytics Insights Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch analytics insights",
            error: error.message
        });
    }
};


// ======================================================
// TRANSACTION TREND
// ======================================================

const getTransactionTrend = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                DATE(createddate) AS day,
                COUNT(*) AS total
            FROM chargetransaction
            WHERE createddate IS NOT NULL
            GROUP BY DATE(createddate)
            ORDER BY day ASC
            LIMIT 30
        `);

        res.json({
            success: true,
            message: "Transaction trend fetched successfully",
            data: rows.map(row => ({
                day: row.day,
                total: Number(row.total || 0)
            }))
        });

    } catch (error) {
        console.error("❌ Transaction Trend Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch transaction trend",
            error: error.message
        });
    }
};


// ======================================================
// ENERGY TREND
// ======================================================

const getEnergyTrend = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                DATE(createddate) AS day,
                COALESCE(SUM(kwh), 0) AS total_kwh
            FROM chargetransaction
            WHERE createddate IS NOT NULL
              AND kwh IS NOT NULL
              AND kwh >= 0
            GROUP BY DATE(createddate)
            ORDER BY day ASC
            LIMIT 30
        `);

        res.json({
            success: true,
            message: "Energy trend fetched successfully",
            data: rows.map(row => ({
                day: row.day,
                kwh: Number(row.total_kwh || 0)
            }))
        });

    } catch (error) {
        console.error("❌ Energy Trend Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch energy trend",
            error: error.message
        });
    }
};


// ======================================================
// CHARGE VALUE TREND
// ======================================================

const getChargeValueTrend = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                DATE(createddate) AS day,
                COALESCE(SUM(chargevalue), 0) AS total_value
            FROM chargetransaction
            WHERE createddate IS NOT NULL
              AND chargevalue IS NOT NULL
            GROUP BY DATE(createddate)
            ORDER BY day ASC
            LIMIT 30
        `);

        res.json({
            success: true,
            message: "Charge value trend fetched successfully",
            data: rows.map(row => ({
                day: row.day,
                value: Number(row.total_value || 0)
            }))
        });

    } catch (error) {
        console.error("❌ Charge Value Trend Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch charge value trend",
            error: error.message
        });
    }
};


// ======================================================
// AUTOSTART ANALYSIS
// ======================================================

const getAutostartAnalytics = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                CASE
                    WHEN autostart = 1
                    THEN 'Autostart'
                    ELSE 'Manual'
                END AS type,
                COUNT(*) AS total
            FROM chargetransaction
            GROUP BY
                CASE
                    WHEN autostart = 1
                    THEN 'Autostart'
                    ELSE 'Manual'
                END
            ORDER BY total DESC
        `);

        res.json({
            success: true,
            message: "Autostart analytics fetched successfully",
            data: rows.map(row => ({
                type: row.type,
                total: Number(row.total || 0)
            }))
        });

    } catch (error) {
        console.error("❌ Autostart Analytics Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch autostart analytics",
            error: error.message
        });
    }
};


// ======================================================
// PEAK USAGE
// ======================================================

const getPeakUsage = async (req, res) => {
    try {

        const [dayRows] = await pool.query(`
            SELECT
                DATE(createddate) AS day,
                COUNT(*) AS total
            FROM chargetransaction
            WHERE createddate IS NOT NULL
            GROUP BY DATE(createddate)
            ORDER BY total DESC
            LIMIT 1
        `);

        const [hourRows] = await pool.query(`
            SELECT
                HOUR(starttime) AS hour,
                COUNT(*) AS total
            FROM chargetransaction
            WHERE starttime IS NOT NULL
            GROUP BY HOUR(starttime)
            ORDER BY total DESC
            LIMIT 1
        `);

        const [energyRows] = await pool.query(`
            SELECT
                COALESCE(SUM(kwh), 0) AS total_kwh
            FROM chargetransaction
            WHERE kwh IS NOT NULL
              AND kwh >= 0
        `);

        const peakDay = dayRows[0] || {};
        const peakHour = hourRows[0] || {};
        const energy = energyRows[0] || {};

        res.json({
            success: true,
            message: "Peak usage fetched successfully",
            data: {
                busiestDay: peakDay.day || null,
                busiestDayTransactions:
                    Number(peakDay.total || 0),

                peakHour:
                    peakHour.hour !== undefined
                        ? Number(peakHour.hour)
                        : null,

                peakHourTransactions:
                    Number(peakHour.total || 0),

                totalKwh:
                    Number(energy.total_kwh || 0)
            }
        });

    } catch (error) {
        console.error("❌ Peak Usage Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch peak usage",
            error: error.message
        });
    }
};


// ======================================================
// TOP ACTIVE CHARGERS
// ======================================================

const getTopChargers = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                deviceid,
                COUNT(*) AS sessions,
                COALESCE(SUM(kwh), 0) AS total_kwh,
                COALESCE(SUM(chargevalue), 0) AS total_value
            FROM chargetransaction
            WHERE deviceid IS NOT NULL
              AND deviceid <> ''
            GROUP BY deviceid
            ORDER BY sessions DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            message: "Top chargers fetched successfully",
            data: rows.map(row => ({
                deviceId: row.deviceid,
                sessions: Number(row.sessions || 0),
                totalKwh: Number(row.total_kwh || 0),
                totalValue: Number(row.total_value || 0)
            }))
        });

    } catch (error) {
        console.error("❌ Top Chargers Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch top chargers",
            error: error.message
        });
    }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    getInsights,
    getTransactionTrend,
    getEnergyTrend,
    getChargeValueTrend,
    getAutostartAnalytics,
    getPeakUsage,
    getTopChargers
};