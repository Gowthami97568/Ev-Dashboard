const pool = require("../config/db");

// ======================================================
// GET WALLET SUMMARY
// ======================================================

const getWalletSummary = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM wallethistory
        `);

        res.json({
            success: true,
            message: "Wallet history summary fetched successfully",
            data: {
                total: Number(rows[0]?.total || 0)
            }
        });

    } catch (error) {

        console.error(
            "❌ Wallet Summary Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch wallet summary",
            error: error.message
        });
    }
};


// ======================================================
// GET WALLET COLUMNS
// ======================================================

const getWalletColumns = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SHOW COLUMNS FROM wallethistory
        `);

        res.json({
            success: true,
            message: "Wallet columns fetched successfully",
            data: {
                columns: rows.map(row => row.Field)
            }
        });

    } catch (error) {

        console.error(
            "❌ Wallet Columns Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch wallet columns",
            error: error.message
        });
    }
};


// ======================================================
// GET WALLET HISTORY
// ======================================================

const getWalletHistory = async (req, res) => {
    try {

        const {
            search = "",
            type = "",
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

        // ------------------------------------------------
        // GET REAL DATABASE DATA
        // ------------------------------------------------

        const [rows] = await pool.query(`
            SELECT *
            FROM wallethistory
        `);

        let filteredRows = rows;

        // ------------------------------------------------
        // GENERIC SEARCH
        // Searches all actual columns
        // ------------------------------------------------

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

        const typeText = String(type).trim().toLowerCase();

        if (typeText !== "") {
            filteredRows = filteredRows.filter(row =>
                String(row.type || '').trim().toLowerCase() === typeText
            );
        }

        // ------------------------------------------------
        // PAGINATION
        // ------------------------------------------------

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
            message: "Wallet history fetched successfully",

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
            "❌ Wallet History Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch wallet history",
            error: error.message
        });
    }
};


// ======================================================
// GET ONE WALLET RECORD
// ======================================================

const getWalletById = async (req, res) => {
    try {

        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT *
            FROM wallethistory
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
                message: "Wallet record not found"
            });
        }

        res.json({
            success: true,
            message: "Wallet record fetched successfully",
            data: record
        });

    } catch (error) {

        console.error(
            "❌ Wallet Record Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch wallet record",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getWalletSummary,
    getWalletColumns,
    getWalletHistory,
    getWalletById
};