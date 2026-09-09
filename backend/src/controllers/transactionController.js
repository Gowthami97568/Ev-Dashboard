const pool = require("../config/db");

// ======================================================
// GET TRANSACTION SUMMARY
// ======================================================

const getTransactionSummary = async (req, res) => {
    try {
        const query = `
            SELECT
                COUNT(*) AS total,

                SUM(
                    CASE
                        WHEN chargestatus = 1 THEN 1
                        ELSE 0
                    END
                ) AS charging,

                SUM(
                    CASE
                        WHEN status = 'Accepted' THEN 1
                        ELSE 0
                    END
                ) AS accepted,

                SUM(
                    CASE
                        WHEN status = 'Stopped' THEN 1
                        ELSE 0
                    END
                ) AS stopped,

                SUM(
                    CASE
                        WHEN status = 'Requested' THEN 1
                        ELSE 0
                    END
                ) AS requested,

                COALESCE(SUM(kwh), 0) AS totalKwh,

                COALESCE(SUM(chargevalue), 0) AS totalChargeValue

            FROM chargetransaction
        `;

        const [rows] = await pool.query(query);

        const row = rows[0] || {};

        res.json({
            success: true,
            message: "Transaction summary fetched successfully",
            data: {
                total: Number(row.total || 0),
                charging: Number(row.charging || 0),
                accepted: Number(row.accepted || 0),
                stopped: Number(row.stopped || 0),
                requested: Number(row.requested || 0),
                totalKwh: Number(row.totalKwh || 0),
                totalChargeValue: Number(row.totalChargeValue || 0)
            }
        });
    } catch (error) {
        console.error("❌ Transaction Summary Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch transaction summary",
            error: error.message
        });
    }
};


// ======================================================
// GET TRANSACTION FILTER OPTIONS
// ======================================================

const getTransactionFilters = async (req, res) => {
    try {
        const [
            createdByRows,
            reasonRows,
            statusRows,
            chargeStatusRows
        ] = await Promise.all([

            pool.query(`
                SELECT DISTINCT createdby
                FROM chargetransaction
                WHERE createdby IS NOT NULL
                  AND TRIM(createdby) <> ''
                ORDER BY createdby
            `),

            pool.query(`
                SELECT DISTINCT reason
                FROM chargetransaction
                WHERE reason IS NOT NULL
                  AND TRIM(reason) <> ''
                ORDER BY reason
            `),

            pool.query(`
                SELECT DISTINCT status
                FROM chargetransaction
                WHERE status IS NOT NULL
                  AND TRIM(status) <> ''
                ORDER BY status
            `),

            pool.query(`
                SELECT DISTINCT chargestatus
                FROM chargetransaction
                WHERE chargestatus IS NOT NULL
                ORDER BY chargestatus
            `)
        ]);

        res.json({
            success: true,
            message: "Transaction filters fetched successfully",
            data: {
                createdBy: createdByRows[0].map(row => row.createdby),

                reasons: reasonRows[0].map(row => row.reason),

                statuses: statusRows[0].map(row => row.status),

                chargeStatuses: chargeStatusRows[0]
                    .map(row => Number(row.chargestatus))
            }
        });

    } catch (error) {
        console.error("❌ Transaction Filters Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch transaction filters",
            error: error.message
        });
    }
};


// ======================================================
// GET TRANSACTIONS
// ======================================================

const getTransactions = async (req, res) => {
    try {
        const {
            search = "",
            chargestatus = "",
            status = "",
            reason = "",
            createdby = "",
            dateFrom = "",
            dateTo = "",
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Math.max(
            parseInt(page, 10) || 1,
            1
        );

        const limitNumber = Math.min(
            Math.max(
                parseInt(limit, 10) || 10,
                1
            ),
            100
        );

        const offset = (pageNumber - 1) * limitNumber;

        const conditions = [];
        const values = [];

        // SEARCH
        if (String(search).trim() !== "") {
            const searchValue = `%${String(search).trim()}%`;

            conditions.push(`
                (
                    CAST(transactionid AS CHAR) LIKE ?
                    OR mobile LIKE ?
                    OR deviceid LIKE ?
                )
            `);

            values.push(
                searchValue,
                searchValue,
                searchValue
            );
        }

        // CHARGE STATUS
        if (chargestatus !== "") {
            conditions.push(`chargestatus = ?`);
            values.push(Number(chargestatus));
        }

        // STATUS
        if (String(status).trim() !== "") {
            conditions.push(`status = ?`);
            values.push(String(status).trim());
        }

        // REASON
        if (String(reason).trim() !== "") {
            conditions.push(`reason = ?`);
            values.push(String(reason).trim());
        }

        // CREATED BY
        if (String(createdby).trim() !== "") {
            conditions.push(`createdby = ?`);
            values.push(String(createdby).trim());
        }

        // DATE FROM
        if (String(dateFrom).trim() !== "") {
            conditions.push(`chargedate >= ?`);
            values.push(String(dateFrom).trim());
        }

        // DATE TO
        if (String(dateTo).trim() !== "") {
            conditions.push(`chargedate <= ?`);
            values.push(String(dateTo).trim());
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        // COUNT
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM chargetransaction
            ${whereClause}
        `;

        const [countRows] = await pool.query(
            countQuery,
            values
        );

        const total = Number(countRows[0]?.total || 0);

        // DATA
        const dataQuery = `
            SELECT
                transactionid,
                mobile,
                deviceid,
                starttime,
                endtime,
                duration,
                chargestatus,
                consumewallet,
                createdby,
                createddate,
                kwh,
                chargedate,
                modifiedBy,
                modifiedDate,
                invoiceid,
                commtime,
                chargevalue,
                reason,
                voltage,
                current,
                status,
                watt,
                autostart,
                rfid
            FROM chargetransaction
            ${whereClause}
            ORDER BY createddate DESC
            LIMIT ${limitNumber}
            OFFSET ${offset}
        `;

        const [rows] = await pool.query(
            dataQuery,
            values
        );

        res.json({
            success: true,
            message: "Transactions fetched successfully",
            data: {
                items: rows,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages:
                        total === 0
                            ? 0
                            : Math.ceil(
                                total / limitNumber
                            )
                }
            }
        });

    } catch (error) {
        console.error("❌ Get Transactions Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions",
            error: error.message
        });
    }
};


// ======================================================
// GET SINGLE TRANSACTION
// ======================================================

const getTransactionById = async (req, res) => {
    try {
        const { transactionid } = req.params;

        const [rows] = await pool.query(
            `
            SELECT
                transactionid,
                mobile,
                deviceid,
                starttime,
                endtime,
                duration,
                chargestatus,
                consumewallet,
                createdby,
                createddate,
                kwh,
                chargedate,
                modifiedBy,
                modifiedDate,
                invoiceid,
                commtime,
                chargevalue,
                reason,
                voltage,
                current,
                status,
                watt,
                autostart,
                rfid
            FROM chargetransaction
            WHERE transactionid = ?
            `,
            [transactionid]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.json({
            success: true,
            message: "Transaction fetched successfully",
            data: rows[0]
        });

    } catch (error) {
        console.error("❌ Get Transaction Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch transaction",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE TRANSACTION
// PUT /api/charge-transactions/:transactionid
// ======================================================

const updateTransaction = async (req, res) => {
    try {
        const { transactionid } = req.params;

        const {
            mobile,
            deviceid,
            starttime,
            endtime,
            duration,
            chargestatus,
            consumewallet,
            kwh,
            chargedate,
            invoiceid,
            commtime,
            chargevalue,
            reason,
            voltage,
            current,
            status,
            watt,
            autostart,
            rfid
        } = req.body;

        // Check whether transaction exists
        const [existingRows] = await pool.query(
            `
            SELECT transactionid
            FROM chargetransaction
            WHERE transactionid = ?
            `,
            [transactionid]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        // Update transaction
        const updateQuery = `
            UPDATE chargetransaction
            SET
                mobile = ?,
                deviceid = ?,
                starttime = ?,
                endtime = ?,
                duration = ?,
                chargestatus = ?,
                consumewallet = ?,
                kwh = ?,
                chargedate = ?,
                invoiceid = ?,
                commtime = ?,
                chargevalue = ?,
                reason = ?,
                voltage = ?,
                current = ?,
                status = ?,
                watt = ?,
                autostart = ?,
                rfid = ?,
                modifiedDate = NOW()
            WHERE transactionid = ?
        `;

        const values = [
            mobile,
            deviceid,
            starttime,
            endtime,
            duration,
            chargestatus,
            consumewallet,
            kwh,
            chargedate,
            invoiceid,
            commtime,
            chargevalue,
            reason,
            voltage,
            current,
            status,
            watt,
            autostart,
            rfid,
            transactionid
        ];

        await pool.query(updateQuery, values);

        // Fetch updated transaction
        const [updatedRows] = await pool.query(
            `
            SELECT
                transactionid,
                mobile,
                deviceid,
                starttime,
                endtime,
                duration,
                chargestatus,
                consumewallet,
                createdby,
                createddate,
                kwh,
                chargedate,
                modifiedBy,
                modifiedDate,
                invoiceid,
                commtime,
                chargevalue,
                reason,
                voltage,
                current,
                status,
                watt,
                autostart,
                rfid
            FROM chargetransaction
            WHERE transactionid = ?
            `,
            [transactionid]
        );

        res.json({
            success: true,
            message: "Transaction updated successfully",
            data: updatedRows[0]
        });

    } catch (error) {
        console.error("❌ Update Transaction Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update transaction",
            error: error.message
        });
    }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    getTransactionSummary,
    getTransactionFilters,
    getTransactions,
    getTransactionById,
    updateTransaction
};