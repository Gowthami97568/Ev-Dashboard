const pool = require("../config/db");

// ======================================================
// GET DEVICE SUMMARY
// ======================================================

const getDeviceSummary = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM devices_master
        `);

        res.json({
            success: true,
            message: "Device summary fetched successfully",
            data: {
                total: Number(rows[0]?.total || 0)
            }
        });

    } catch (error) {
        console.error("❌ Device Summary Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch device summary",
            error: error.message
        });
    }
};


// ======================================================
// GET DEVICE COLUMNS
// ======================================================

const getDeviceColumns = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SHOW COLUMNS FROM devices_master
        `);

        res.json({
            success: true,
            message: "Device columns fetched successfully",
            data: {
                columns: rows.map(row => row.Field)
            }
        });

    } catch (error) {
        console.error("❌ Device Columns Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch device columns",
            error: error.message
        });
    }
};


// ======================================================
// GET DEVICES
// ======================================================

const getDevices = async (req, res) => {
    try {
        const {
            search = "",
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

        // ----------------------------------------------
        // FETCH ALL DEVICES
        // ----------------------------------------------

        const [rows] = await pool.query(`
            SELECT *
            FROM devices_master
        `);

        // ----------------------------------------------
        // SEARCH
        // ----------------------------------------------

        let filteredRows = rows;

        const searchText =
            String(search)
                .trim()
                .toLowerCase();

        if (searchText) {

            filteredRows = rows.filter(row => {

                return Object.values(row).some(value => {

                    if (
                        value === null ||
                        value === undefined
                    ) {
                        return false;
                    }

                    return String(value)
                        .toLowerCase()
                        .includes(searchText);
                });

            });
        }

        // ----------------------------------------------
        // PAGINATION
        // ----------------------------------------------

        const total = filteredRows.length;

        const offset =
            (pageNumber - 1) * limitNumber;

        const items =
            filteredRows.slice(
                offset,
                offset + limitNumber
            );

        const totalPages =
            total === 0
                ? 0
                : Math.ceil(
                    total / limitNumber
                );

        // ----------------------------------------------
        // RESPONSE
        // ----------------------------------------------

        res.json({
            success: true,
            message: "Devices fetched successfully",

            data: {
                items,

                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages
                }
            }
        });

    } catch (error) {

        console.error(
            "❌ Get Devices Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch devices",
            error: error.message
        });
    }
};


// ======================================================
// GET DEVICE BY SLNO
// ======================================================

const getDeviceById = async (req, res) => {
    try {

        const { id } = req.params;

        if (
            id === undefined ||
            id === null ||
            String(id).trim() === ""
        ) {

            return res.status(400).json({
                success: false,
                message: "Device SLNO is required"
            });
        }

        // ----------------------------------------------
        // IMPORTANT:
        // SLNO is used as the record identifier
        // ----------------------------------------------

        const [rows] = await pool.query(
            `
            SELECT *
            FROM devices_master
            WHERE SLNO = ?
            LIMIT 1
            `,
            [id]
        );

        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Device not found"
            });
        }

        res.json({
            success: true,
            message: "Device fetched successfully",
            data: rows[0]
        });

    } catch (error) {

        console.error(
            "❌ Get Device Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch device",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE DEVICE
// ======================================================

const updateDevice = async (req, res) => {

    try {

        const { id } = req.params;

        // ----------------------------------------------
        // VALIDATE SLNO
        // ----------------------------------------------

        if (
            id === undefined ||
            id === null ||
            String(id).trim() === ""
        ) {

            return res.status(400).json({
                success: false,
                message: "Device SLNO is required"
            });
        }

        // ----------------------------------------------
        // REQUEST BODY
        // ----------------------------------------------

        const body = req.body || {};

        // ----------------------------------------------
        // GET ACTUAL DATABASE COLUMNS
        // ----------------------------------------------

        const [columnRows] = await pool.query(`
            SHOW COLUMNS FROM devices_master
        `);

        const dbColumns =
            columnRows.map(
                column => column.Field
            );

        // ----------------------------------------------
        // FIND SLNO COLUMN
        // ----------------------------------------------

        const slnoColumn =
            dbColumns.find(
                column =>
                    String(column)
                        .toLowerCase() === "slno"
            );

        if (!slnoColumn) {

            return res.status(500).json({
                success: false,
                message:
                    "SLNO column was not found in devices_master"
            });
        }

        // ----------------------------------------------
        // ONLY UPDATE EXISTING DB COLUMNS
        //
        // DO NOT UPDATE SLNO
        // ----------------------------------------------

        const updateColumns =
            dbColumns.filter(
                column =>
                    column !== slnoColumn &&
                    Object.prototype.hasOwnProperty.call(
                        body,
                        column
                    )
            );

        if (updateColumns.length === 0) {

            return res.status(400).json({
                success: false,
                message: "No device fields were provided for update"
            });
        }

        // ----------------------------------------------
        // BUILD UPDATE QUERY
        // ----------------------------------------------

        const setClause =
            updateColumns
                .map(
                    column =>
                        `\`${column}\` = ?`
                )
                .join(", ");

        const values =
            updateColumns.map(
                column => body[column]
            );

        values.push(id);

        const updateQuery = `
            UPDATE devices_master
            SET ${setClause}
            WHERE \`${slnoColumn}\` = ?
        `;

        console.log(
            "🟢 Device Update Query:",
            updateQuery
        );

        console.log(
            "🟢 Device Update Values:",
            values
        );

        // ----------------------------------------------
        // UPDATE DATABASE
        // ----------------------------------------------

        const [result] =
            await pool.query(
                updateQuery,
                values
            );

        // ----------------------------------------------
        // CHECK RECORD
        // ----------------------------------------------

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message:
                    `Device with SLNO ${id} was not found`
            });
        }

        // ----------------------------------------------
        // GET UPDATED RECORD
        // ----------------------------------------------

        const [updatedRows] =
            await pool.query(
                `
                SELECT *
                FROM devices_master
                WHERE \`${slnoColumn}\` = ?
                LIMIT 1
                `,
                [id]
            );

        // ----------------------------------------------
        // SUCCESS
        // ----------------------------------------------

        res.json({
            success: true,
            message: "Device updated successfully",
            data: updatedRows[0]
        });

    } catch (error) {

        console.error(
            "❌ Update Device Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update device",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getDeviceSummary,
    getDeviceColumns,
    getDevices,
    getDeviceById,
    updateDevice
};