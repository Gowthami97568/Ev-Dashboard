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
            where.push(`(starttime >= ? OR COALESCE(chargestatus, 0) = 1)`);
            params.push(fromDateTime.replace('T', ' '));
        }

        if (toDateTime) {
            where.push(`starttime <= ?`);
            params.push(toDateTime.replace('T', ' '));
        }

        const query = `
            SELECT
                transactionid AS transactionId,
                deviceid AS deviceId,
                DATE(starttime) AS date,
                TIME(starttime) AS time,
                HOUR(starttime) AS hour,
                chargestatus AS chargeStatus,
                status,
                endtime AS endTime,
                kwh,
                chargevalue AS chargeValue
            FROM chargetransaction
                        WHERE ${where.join("\n              AND ")}
            ORDER BY starttime DESC
                        ${deviceId ? '' : 'LIMIT 100'}
        `;

                const [rows] = await pool.query(query, params);

        const logs = rows.map(row => ({
            type: Number(row.chargeStatus) === 1
                ? "Charging"
                : "Transaction",
            deviceId: row.deviceId,
            date: row.date,
            time: row.time,
            hour: Number(row.hour),
            message: [
                `Transaction ID: ${row.transactionId}`,
                `Charge status: ${row.chargeStatus ?? "N/A"}`,
                row.status ? `Status: ${row.status}` : null,
                row.endTime ? `End time: ${row.endTime}` : null,
                row.kwh !== null && row.kwh !== undefined ? `Energy: ${row.kwh} kWh` : null,
                row.chargeValue !== null && row.chargeValue !== undefined
                    ? `Charge value: ${row.chargeValue}`
                    : null
            ].filter(Boolean).join(" | ")
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