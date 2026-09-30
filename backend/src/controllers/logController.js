const pool = require("../config/db");

const getLogDeviceIds = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT TRIM(deviceid) AS deviceId
            FROM chargetransaction
            WHERE deviceid IS NOT NULL
              AND TRIM(deviceid) <> ''
            ORDER BY deviceId
        `);

        res.json({
            success: true,
            message: "Transaction device IDs fetched successfully",
            data: rows.map(row => row.deviceId)
        });
    } catch (error) {
        console.error("❌ Log Device IDs Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch transaction device IDs",
            error: error.message
        });
    }
};

// ======================================================
// GET LOGS
// ======================================================

const getLogs = async (req, res) => {
    try {

        const deviceId = String(req.query.deviceId || '').trim();
        const fromDateTime = String(req.query.fromDateTime || '').trim();
        const toDateTime = String(req.query.toDateTime || '').trim();
        const where = [
            `deviceid IS NOT NULL`,
            `deviceid <> ''`,
            `starttime IS NOT NULL`
        ];
        const params = [];

        if (deviceId) {
            where.push(`deviceid = ?`);
            params.push(deviceId);
        }

        if (fromDateTime) {
            where.push(`starttime >= ?`);
            params.push(fromDateTime.replace('T', ' '));
        }

        if (toDateTime) {
            where.push(`starttime <= ?`);
            params.push(toDateTime.replace('T', ' '));
        }

        const query = `
            SELECT
                deviceid AS deviceId,
                DATE(starttime) AS date,
                TIME(starttime) AS time,
                HOUR(starttime) AS hour
            FROM chargetransaction
                        WHERE ${where.join("\n              AND ")}
            ORDER BY starttime DESC
                        ${deviceId ? '' : 'LIMIT 100'}
        `;

                const [rows] = await pool.query(query, params);

        const logs = rows.map(row => ({
            deviceId: row.deviceId,
            date: row.date,
            time: row.time,
            hour: Number(row.hour)
        }));

        console.log("✅ Logs fetched:", logs.length);

        res.json({
            success: true,
            message: "Logs fetched successfully",
            data: logs
        });

    } catch (error) {

        console.error("❌ Logs Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch logs",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getLogDeviceIds,
    getLogs
};