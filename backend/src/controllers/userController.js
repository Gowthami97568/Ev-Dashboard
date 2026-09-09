const pool = require("../config/db");


// =====================================================
// GET ALL USERS
// =====================================================

const getAllUsers = async (req, res) => {
    try {

        const [rows] = await pool.query(
            "SELECT * FROM evusers"
        );

        res.json({
            success: true,
            message: "User data fetched successfully",
            count: rows.length,
            data: rows
        });

    } catch (error) {

        console.error("User error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user data",
            error: error.message
        });

    }
};


// =====================================================
// UPDATE USER
// =====================================================

const updateUser = async (req, res) => {

    try {

        // -------------------------------------------------
        // USER ID
        // -------------------------------------------------

        const userId = req.params.id;


        if (
            userId === undefined ||
            userId === null ||
            userId === ""
        ) {

            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });

        }


        // -------------------------------------------------
        // YOUR EV USERS TABLE PRIMARY KEY
        // -------------------------------------------------

        const idColumn = "consumerid";


        // -------------------------------------------------
        // GET TABLE STRUCTURE
        // -------------------------------------------------

        const [columns] = await pool.query(
            "DESCRIBE evusers"
        );


        // -------------------------------------------------
        // GET VALID DATABASE COLUMNS
        // -------------------------------------------------

        const validColumns = columns.map(
            column => column.Field
        );


        // -------------------------------------------------
        // REQUEST BODY
        // -------------------------------------------------

        const requestData = req.body || {};


        console.log(
            "----------------------------------------"
        );

        console.log(
            "Updating EV User"
        );

        console.log(
            "Consumer ID:",
            userId
        );

        console.log(
            "Request Body:",
            requestData
        );


        // -------------------------------------------------
        // PREPARE DATA FOR UPDATE
        // -------------------------------------------------

        const updateData = {};


        Object.keys(requestData).forEach(
            key => {

                // Only update columns that actually
                // exist in evusers.

                if (
                    validColumns.includes(key) &&
                    key !== idColumn
                ) {

                    updateData[key] =
                        requestData[key];

                }

            }
        );


        // -------------------------------------------------
        // CONVERT DATE/TIME VALUES
        // -------------------------------------------------

        columns.forEach(column => {

            const columnName =
                column.Field;

            const columnType =
                column.Type.toLowerCase();


            // Check MySQL datetime/timestamp columns

            if (
                (
                    columnType.includes("datetime") ||
                    columnType.includes("timestamp")
                ) &&
                updateData[columnName] !== null &&
                updateData[columnName] !== undefined &&
                updateData[columnName] !== ""
            ) {

                const value =
                    updateData[columnName];


                // If frontend sends ISO date:
                //
                // 2022-01-17T08:24:19.000Z
                //
                // Convert to:
                //
                // 2022-01-17 08:24:19

                if (
                    typeof value === "string"
                ) {

                    const date =
                        new Date(value);


                    if (
                        !isNaN(
                            date.getTime()
                        )
                    ) {

                        updateData[columnName] =
                            date
                                .toISOString()
                                .slice(0, 19)
                                .replace("T", " ");

                    }

                }

            }

        });


        // -------------------------------------------------
        // CHECK DATA
        // -------------------------------------------------

        const updateKeys =
            Object.keys(updateData);


        if (
            updateKeys.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "No valid fields to update"
            });

        }


        // -------------------------------------------------
        // CREATE SQL SET CLAUSE
        // -------------------------------------------------

        const setClause =
            updateKeys
                .map(
                    key =>
                        `\`${key}\` = ?`
                )
                .join(", ");


        // -------------------------------------------------
        // CREATE VALUES
        // -------------------------------------------------

        const values =
            updateKeys.map(
                key =>
                    updateData[key]
            );


        // Add consumerid for WHERE condition

        values.push(userId);


        // -------------------------------------------------
        // UPDATE SQL
        // -------------------------------------------------

        const sql = `
            UPDATE evusers
            SET ${setClause}
            WHERE \`${idColumn}\` = ?
        `;


        console.log(
            "ID Column:",
            idColumn
        );

        console.log(
            "User ID:",
            userId
        );

        console.log(
            "Update Data:",
            updateData
        );

        console.log(
            "SQL:",
            sql
        );


        // -------------------------------------------------
        // UPDATE DATABASE
        // -------------------------------------------------

        const [result] =
            await pool.query(
                sql,
                values
            );


        console.log(
            "Affected Rows:",
            result.affectedRows
        );


        // -------------------------------------------------
        // USER NOT FOUND
        // -------------------------------------------------

        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "User not found or no changes were made"
            });

        }


        // -------------------------------------------------
        // GET UPDATED USER
        // -------------------------------------------------

        const [updatedRows] =
            await pool.query(
                `
                SELECT *
                FROM evusers
                WHERE \`${idColumn}\` = ?
                `,
                [userId]
            );


        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        console.log(
            "Updated User:",
            updatedRows[0]
        );

        console.log(
            "----------------------------------------"
        );


        return res.json({
            success: true,
            message: "User updated successfully",
            data: updatedRows[0]
        });


    } catch (error) {

        console.error(
            "Update user error:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message
        });

    }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getAllUsers,
    updateUser
};