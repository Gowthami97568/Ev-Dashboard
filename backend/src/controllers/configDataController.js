const pool = require("../config/db");


// ======================================================
// GET PRIMARY KEY / IDENTIFIER COLUMN
// ======================================================

const getIdentifierColumn = async () => {

    // --------------------------------------------------
    // First try actual PRIMARY KEY
    // --------------------------------------------------

    const [primaryKeys] = await pool.query(`
        SHOW KEYS
        FROM config_data
        WHERE Key_name = 'PRIMARY'
        ORDER BY Seq_in_index
    `);

    if (
        primaryKeys.length > 0 &&
        primaryKeys[0].Column_name
    ) {

        return primaryKeys[0].Column_name;

    }


    // --------------------------------------------------
    // If no primary key, inspect table columns
    // --------------------------------------------------

    const [columns] = await pool.query(`
        SHOW COLUMNS FROM config_data
    `);


    const possibleNames = [
        "id",
        "ID",
        "configid",
        "configId",
        "config_id",
        "configdataid",
        "configDataId",
        "config_data_id",
        "recordid",
        "recordId",
        "record_id"
    ];


    for (const possibleName of possibleNames) {

        const found = columns.find(
            column =>
                String(column.Field).toLowerCase() ===
                String(possibleName).toLowerCase()
        );


        if (found) {

            return found.Field;

        }

    }


    // --------------------------------------------------
    // No identifier found
    // --------------------------------------------------

    return null;

};


// ======================================================
// GET CONFIG DATA SUMMARY
// ======================================================

const getConfigDataSummary = async (req, res) => {

    try {

        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM config_data
        `);


        res.json({

            success: true,

            message:
                "Config data summary fetched successfully",

            data: {

                total:
                    Number(
                        rows[0]?.total || 0
                    )

            }

        });

    } catch (error) {

        console.error(
            "❌ Config Data Summary Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch config data summary",

            error:
                error.message

        });

    }

};


// ======================================================
// GET CONFIG DATA COLUMNS
// ======================================================

const getConfigDataColumns = async (req, res) => {

    try {

        const [rows] = await pool.query(`
            SHOW COLUMNS FROM config_data
        `);


        res.json({

            success: true,

            message:
                "Config data columns fetched successfully",

            data: {

                columns:
                    rows.map(
                        row => row.Field
                    )

            }

        });

    } catch (error) {

        console.error(
            "❌ Config Data Columns Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch config data columns",

            error:
                error.message

        });

    }

};


// ======================================================
// GET CONFIG DATA RECORDS
// ======================================================

const getConfigData = async (req, res) => {

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
            FROM config_data
        `);


        let filteredRows = rows;


        const searchText =
            String(search)
                .trim()
                .toLowerCase();


        if (searchText !== "") {

            filteredRows =
                rows.filter(row =>

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
            (pageNumber - 1) *
            limitNumber;


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

            message:
                "Config data fetched successfully",

            data: {

                items,

                pagination: {

                    page:
                        pageNumber,

                    limit:
                        limitNumber,

                    total,

                    totalPages

                }

            }

        });

    } catch (error) {

        console.error(
            "❌ Config Data Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch config data",

            error:
                error.message

        });

    }

};


// ======================================================
// GET SINGLE CONFIG DATA RECORD
// ======================================================

const getConfigDataById = async (req, res) => {

    try {

        const { id } = req.params;


        const identifierColumn =
            await getIdentifierColumn();


        if (!identifierColumn) {

            return res.status(500).json({

                success: false,

                message:
                    "No primary key or identifier column found in config_data."

            });

        }


        const query = `
            SELECT *
            FROM config_data
            WHERE \`${identifierColumn}\` = ?
            LIMIT 1
        `;


        const [rows] =
            await pool.query(
                query,
                [id]
            );


        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Config data record not found"

            });

        }


        res.json({

            success: true,

            message:
                "Config data record fetched successfully",

            data:
                rows[0]

        });

    } catch (error) {

        console.error(
            "❌ Config Data Record Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch config data record",

            error:
                error.message

        });

    }

};


// ======================================================
// UPDATE CONFIG DATA RECORD
// ======================================================

const updateConfigData = async (req, res) => {

    try {

        const { id } = req.params;

        const payload = req.body || {};


        // --------------------------------------------------
        // Get actual database identifier
        // --------------------------------------------------

        const identifierColumn =
            await getIdentifierColumn();


        if (!identifierColumn) {

            return res.status(500).json({

                success: false,

                message:
                    "No primary key or identifier column found in config_data."

            });

        }


        // --------------------------------------------------
        // Get actual database columns
        // --------------------------------------------------

        const [columnRows] =
            await pool.query(`
                SHOW COLUMNS FROM config_data
            `);


        const databaseColumns =
            columnRows.map(
                column => column.Field
            );


        // --------------------------------------------------
        // Build update fields
        // --------------------------------------------------

        const updateColumns = [];

        const updateValues = [];


        for (
            const column of databaseColumns
        ) {

            // Never update identifier
            if (
                column === identifierColumn
            ) {

                continue;

            }


            // Only update fields actually
            // sent by frontend
            if (
                Object.prototype.hasOwnProperty.call(
                    payload,
                    column
                )
            ) {

                updateColumns.push(
                    `\`${column}\` = ?`
                );


                updateValues.push(
                    payload[column]
                );

            }

        }


        // --------------------------------------------------
        // Nothing to update
        // --------------------------------------------------

        if (
            updateColumns.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No editable configuration fields were provided."

            });

        }


        // --------------------------------------------------
        // Add ID to WHERE
        // --------------------------------------------------

        updateValues.push(id);


        const updateQuery = `
            UPDATE config_data
            SET ${updateColumns.join(", ")}
            WHERE \`${identifierColumn}\` = ?
        `;


        console.log(
            "📝 Config Update Query:",
            updateQuery
        );

        console.log(
            "📝 Config Update Values:",
            updateValues
        );


        // --------------------------------------------------
        // Execute UPDATE
        // --------------------------------------------------

        const [result] =
            await pool.query(
                updateQuery,
                updateValues
            );


        // --------------------------------------------------
        // Record not found
        // --------------------------------------------------

        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Config data record not found or no changes were made."

            });

        }


        // --------------------------------------------------
        // Fetch updated record
        // --------------------------------------------------

        const [updatedRows] =
            await pool.query(
                `
                    SELECT *
                    FROM config_data
                    WHERE \`${identifierColumn}\` = ?
                    LIMIT 1
                `,
                [id]
            );


        // --------------------------------------------------
        // SUCCESS
        // --------------------------------------------------

        res.json({

            success: true,

            message:
                "Configuration record updated successfully.",

            data:
                updatedRows[0] || null

        });

    } catch (error) {

        console.error(
            "❌ Config Data Update Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update configuration record.",

            error:
                error.message

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getConfigDataSummary,

    getConfigDataColumns,

    getConfigData,

    getConfigDataById,

    updateConfigData

};