const pool = require("../config/db");

// ======================================================
// GET APP VERSION SUMMARY
// ======================================================

const getAppVersionSummary = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM appversion
        `);

        res.json({
            success: true,
            message: "App version summary fetched successfully",
            data: {
                total: Number(rows[0]?.total || 0)
            }
        });

    } catch (error) {

        console.error(
            "❌ App Version Summary Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch app version summary",
            error: error.message
        });
    }
};


// ======================================================
// GET APP VERSION COLUMNS
// ======================================================

const getAppVersionColumns = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SHOW COLUMNS FROM appversion
        `);

        res.json({
            success: true,
            message: "App version columns fetched successfully",
            data: {
                columns: rows.map(row => row.Field)
            }
        });

    } catch (error) {

        console.error(
            "❌ App Version Columns Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch app version columns",
            error: error.message
        });
    }
};


// ======================================================
// GET APP VERSION RECORDS
// ======================================================

const getAppVersions = async (req, res) => {
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
            FROM appversion
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
            message: "App versions fetched successfully",

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
            "❌ App Versions Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch app versions",
            error: error.message
        });
    }
};


// ======================================================
// GET SINGLE APP VERSION
// ======================================================

const getAppVersionById = async (req, res) => {
    try {

        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT *
            FROM appversion
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
                message: "App version record not found"
            });
        }

        res.json({
            success: true,
            message: "App version record fetched successfully",
            data: record
        });

    } catch (error) {

        console.error(
            "❌ App Version Record Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch app version record",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getAppVersionSummary,
    getAppVersionColumns,
    getAppVersions,
    getAppVersionById
};