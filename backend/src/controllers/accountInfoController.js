const pool = require("../config/db");

// ======================================================
// GET ACCOUNT INFO SUMMARY
// ======================================================

const getAccountInfoSummary = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM accountinfo
        `);

        res.json({
            success: true,
            message: "Account info summary fetched successfully",
            data: {
                total: Number(rows[0]?.total || 0)
            }
        });

    } catch (error) {

        console.error(
            "❌ Account Info Summary Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch account info summary",
            error: error.message
        });
    }
};


// ======================================================
// GET ACCOUNT INFO COLUMNS
// ======================================================

const getAccountInfoColumns = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SHOW COLUMNS FROM accountinfo
        `);

        res.json({
            success: true,
            message: "Account info columns fetched successfully",
            data: {
                columns: rows.map(row => row.Field)
            }
        });

    } catch (error) {

        console.error(
            "❌ Account Info Columns Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch account info columns",
            error: error.message
        });
    }
};


// ======================================================
// GET ACCOUNT INFO RECORDS
// ======================================================

const getAccountInfo = async (req, res) => {
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
            FROM accountinfo
        `);

        let filteredRows = rows;

        const searchText =
            String(search)
                .trim()
                .toLowerCase();

        if (searchText !== "") {

            filteredRows = rows.filter(row => {

                return Object.values(row).some(
                    value => {

                        if (
                            value === null ||
                            value === undefined
                        ) {
                            return false;
                        }

                        return String(value)
                            .toLowerCase()
                            .includes(searchText);
                    }
                );
            });
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
            message: "Account info fetched successfully",
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
            "❌ Account Info Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch account info",
            error: error.message
        });
    }
};


// ======================================================
// GET SINGLE ACCOUNT INFO RECORD
// ======================================================

const getAccountInfoById = async (req, res) => {
    try {

        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT *
            FROM accountinfo
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
                message: "Account info record not found"
            });
        }

        res.json({
            success: true,
            message: "Account info record fetched successfully",
            data: record
        });

    } catch (error) {

        console.error(
            "❌ Account Info Record Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch account info record",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getAccountInfoSummary,
    getAccountInfoColumns,
    getAccountInfo,
    getAccountInfoById
};