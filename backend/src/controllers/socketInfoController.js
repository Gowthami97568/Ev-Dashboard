const pool = require("../config/db");

// ======================================================
// GET SOCKET INFO SUMMARY
// ======================================================

const getSocketInfoSummary = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM socketInfo
        `);

        res.json({
            success: true,
            message: "Socket info summary fetched successfully",
            data: {
                total: Number(rows[0]?.total || 0)
            }
        });

    } catch (error) {

        console.error(
            "❌ Socket Info Summary Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch socket info summary",
            error: error.message
        });
    }
};


// ======================================================
// GET SOCKET INFO COLUMNS
// ======================================================

const getSocketInfoColumns = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SHOW COLUMNS FROM socketInfo
        `);

        res.json({
            success: true,
            message: "Socket info columns fetched successfully",
            data: {
                columns: rows.map(row => row.Field)
            }
        });

    } catch (error) {

        console.error(
            "❌ Socket Info Columns Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch socket info columns",
            error: error.message
        });
    }
};


// ======================================================
// GET SOCKET INFO RECORDS
// ======================================================

const getSocketInfo = async (req, res) => {
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

        const [rows] = await pool.query(`
            SELECT *
            FROM socketInfo
        `);

        let filteredRows = rows;

        const searchText =
            String(search)
                .trim()
                .toLowerCase();

        if (searchText !== "") {

            filteredRows = rows.filter(row =>
                Object.values(row).some(value => {

                    if (
                        value === null ||
                        value === undefined
                    ) {
                        return false;
                    }

                    return String(value)
                        .toLowerCase()
                        .includes(searchText);
                })
            );
        }

        const total =
            filteredRows.length;

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

        res.json({
            success: true,
            message: "Socket info fetched successfully",
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
            "❌ Socket Info Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch socket info",
            error: error.message
        });
    }
};


// ======================================================
// GET SINGLE SOCKET INFO RECORD
// ======================================================

const getSocketInfoById = async (req, res) => {
    try {

        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT *
            FROM socketInfo
        `);

        const record = rows.find(row =>
            Object.values(row).some(
                value =>
                    value !== null &&
                    value !== undefined &&
                    String(value) === String(id)
            )
        );

        if (!record) {

            return res.status(404).json({
                success: false,
                message: "Socket info record not found"
            });
        }

        res.json({
            success: true,
            message: "Socket info record fetched successfully",
            data: record
        });

    } catch (error) {

        console.error(
            "❌ Socket Info Record Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch socket info record",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getSocketInfoSummary,
    getSocketInfoColumns,
    getSocketInfo,
    getSocketInfoById
};