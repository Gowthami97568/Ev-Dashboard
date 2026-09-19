const pool = require("../config/db");


// ======================================================
// GET CHARGER SUMMARY
// ======================================================

const getChargerSummary = async (req, res) => {
    try {

        const query = `
            SELECT
                COUNT(*) AS total,

                SUM(
                    CASE
                        WHEN active = 1 THEN 1
                        ELSE 0
                    END
                ) AS active,

                SUM(
                    CASE
                        WHEN active = 0 OR active IS NULL THEN 1
                        ELSE 0
                    END
                ) AS inactive,

                SUM(
                    CASE
                        WHEN fullday = 1 THEN 1
                        ELSE 0
                    END
                ) AS fullDay

            FROM chargeman
        `;

        const [rows] = await pool.query(query);

        const row = rows[0] || {};

        res.json({
            success: true,
            message: "Charger summary fetched successfully",

            data: {
                total: Number(row.total || 0),
                active: Number(row.active || 0),
                inactive: Number(row.inactive || 0),
                fullDay: Number(row.fullDay || 0)
            }
        });

    } catch (error) {

        console.error(
            "❌ Charger Summary Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch charger summary",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL CHARGERS
// ======================================================

const getChargers = async (req, res) => {
    try {

        const {
            search = "",
            active = "",
            devicetype = "",
            country = "",
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
            500
        );


        const offset =
            (pageNumber - 1) * limitNumber;


        const conditions = [];
        const values = [];


        // ==================================================
        // SEARCH
        // ==================================================

        if (String(search).trim() !== "") {

            const searchValue =
                `%${String(search).trim()}%`;

            conditions.push(`
                (
                    mobile LIKE ?
                    OR deviceid LIKE ?
                    OR hostname LIKE ?
                    OR hostaddress LIKE ?
                    OR latlong LIKE ?
                    OR country LIKE ?
                    OR devicetype LIKE ?
                )
            `);

            values.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }


        // ==================================================
        // ACTIVE FILTER
        // ==================================================

        if (active !== "") {

            conditions.push(
                `active = ?`
            );

            values.push(
                Number(active)
            );
        }


        // ==================================================
        // DEVICE TYPE FILTER
        // ==================================================

        if (String(devicetype).trim() !== "") {

            conditions.push(
                `devicetype = ?`
            );

            values.push(
                String(devicetype).trim()
            );
        }


        // ==================================================
        // COUNTRY FILTER
        // ==================================================

        if (String(country).trim() !== "") {

            conditions.push(
                `country = ?`
            );

            values.push(
                String(country).trim()
            );
        }


        // ==================================================
        // WHERE
        // ==================================================

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";


        // ==================================================
        // TOTAL COUNT
        // ==================================================

        const countQuery = `
            SELECT
                COUNT(*) AS total
            FROM chargeman
            ${whereClause}
        `;


        const [countRows] =
            await pool.query(
                countQuery,
                values
            );


        const total =
            Number(
                countRows[0]?.total || 0
            );


        // ==================================================
        // GET DATA
        //
        // IMPORTANT:
        // starttime/endtime are NOT included because the
        // live API returned:
        // Unknown column 'starttime'
        // ==================================================

        const dataQuery = `
            SELECT

                mobile,
                deviceid,
                connectorid,
                deviceparent,
                devicekw,
                devicetype,
                hostname,
                hostaddress,
                latlong,
                chargettype,
                rph,
                active,
                capacity,
                createdby,
                createddate,
                modifiedby,
                modifieddate,
                fullday,
                country

            FROM chargeman

            ${whereClause}

            ORDER BY createddate DESC

            LIMIT ${limitNumber}
            OFFSET ${offset}
        `;


        const [rows] =
            await pool.query(
                dataQuery,
                values
            );


        console.log(
            `✅ Chargers fetched: ${rows.length}`
        );


        res.json({
            success: true,

            message:
                "Chargers fetched successfully",

            data: {

                items: rows,

                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: total,
                    totalPages:
                        Math.ceil(
                            total / limitNumber
                        )
                }

            }
        });

    } catch (error) {

        console.error(
            "❌ Get Chargers Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch chargers",

            error:
                error.message
        });
    }
};


// ======================================================
// GET ONE CHARGER
// ======================================================

const getChargerById = async (req, res) => {

    try {

        const {
            deviceid
        } = req.params;


        const [rows] =
            await pool.query(
                `
                SELECT

                    mobile,
                    deviceid,
                    connectorid,
                    deviceparent,
                    devicekw,
                    devicetype,
                    hostname,
                    hostaddress,
                    latlong,
                    chargettype,
                    rph,
                    active,
                    capacity,
                    createdby,
                    createddate,
                    modifiedby,
                    modifieddate,
                    fullday,
                    country

                FROM chargeman

                WHERE deviceid = ?
                `,
                [deviceid]
            );


        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Charger not found"
            });
        }


        res.json({

            success: true,

            message:
                "Charger fetched successfully",

            data:
                rows[0]
        });

    } catch (error) {

        console.error(
            "❌ Get Charger Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch charger",

            error:
                error.message
        });
    }
};


// ======================================================
// CREATE CHARGER
// ======================================================

const createCharger = async (req, res) => {

    try {

        const {

            mobile,
            deviceid,
            connectorid,
            deviceparent,
            devicekw,
            devicetype,
            hostname,
            hostaddress,
            latlong,
            chargettype,
            rph,
            active,
            capacity,
            createdby,
            fullday,
            country

        } = req.body;


        // ==================================================
        // DEVICE ID REQUIRED
        // ==================================================

        if (
            !deviceid ||
            String(deviceid).trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Device ID is required"
            });
        }


        // ==================================================
        // CHECK DUPLICATE DEVICE ID
        // ==================================================

        const [existing] =
            await pool.query(
                `
                SELECT
                    deviceid
                FROM chargeman
                WHERE deviceid = ?
                `,
                [deviceid]
            );


        if (existing.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Device ID already exists"
            });
        }


        // ==================================================
        // INSERT
        // ==================================================

        await pool.query(
            `
            INSERT INTO chargeman (

                mobile,
                deviceid,
                connectorid,
                deviceparent,
                devicekw,
                devicetype,
                hostname,
                hostaddress,
                latlong,
                chargettype,
                rph,
                active,
                capacity,
                createdby,
                createddate,
                fullday,
                country

            )

            VALUES (

                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, NOW(), ?, ?

            )
            `,
            [

                mobile ?? null,

                deviceid,

                connectorid ?? null,

                deviceparent ?? null,

                devicekw ?? null,

                devicetype ?? null,

                hostname ?? null,

                hostaddress ?? null,

                latlong ?? null,

                chargettype ?? null,

                rph ?? null,

                active ?? 1,

                capacity ?? null,

                createdby ?? "Admin",

                fullday ?? 0,

                country ?? null

            ]
        );


        res.status(201).json({

            success: true,

            message:
                "Charger created successfully"
        });

    } catch (error) {

        console.error(
            "❌ Create Charger Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to create charger",

            error:
                error.message
        });
    }
};


// ======================================================
// UPDATE CHARGER
// ======================================================

const updateCharger = async (req, res) => {

    try {

        const {
            deviceid
        } = req.params;


        const {

            mobile,
            connectorid,
            deviceparent,
            devicekw,
            devicetype,
            hostname,
            hostaddress,
            latlong,
            chargettype,
            rph,
            active,
            capacity,
            modifiedby,
            fullday,
            country

        } = req.body;


        // ==================================================
        // CHECK EXISTING RECORD
        // ==================================================

        const [existing] =
            await pool.query(
                `
                SELECT
                    deviceid

                FROM chargeman

                WHERE deviceid = ?
                `,
                [deviceid]
            );


        if (existing.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Charger not found"
            });
        }


        // ==================================================
        // UPDATE
        // ==================================================

        await pool.query(
            `
            UPDATE chargeman

            SET

                mobile = ?,
                connectorid = ?,
                deviceparent = ?,
                devicekw = ?,
                devicetype = ?,
                hostname = ?,
                hostaddress = ?,
                latlong = ?,
                chargettype = ?,
                rph = ?,
                active = ?,
                capacity = ?,
                modifiedby = ?,
                modifieddate = NOW(),
                fullday = ?,
                country = ?

            WHERE deviceid = ?
            `,
            [

                mobile ?? null,

                connectorid ?? null,

                deviceparent ?? null,

                devicekw ?? null,

                devicetype ?? null,

                hostname ?? null,

                hostaddress ?? null,

                latlong ?? null,

                chargettype ?? null,

                rph ?? null,

                active ?? 0,

                capacity ?? null,

                modifiedby ?? "Admin",

                fullday ?? 0,

                country ?? null,

                deviceid

            ]
        );


        res.json({

            success: true,

            message:
                "Charger updated successfully"
        });

    } catch (error) {

        console.error(
            "❌ Update Charger Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to update charger",

            error:
                error.message
        });
    }
};


// ======================================================
// DELETE CHARGER
// ======================================================

const deleteCharger = async (req, res) => {

    try {

        const {
            deviceid
        } = req.params;


        const [result] =
            await pool.query(
                `
                DELETE FROM chargeman

                WHERE deviceid = ?
                `,
                [deviceid]
            );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Charger not found"
            });
        }


        res.json({

            success: true,

            message:
                "Charger deleted successfully"
        });

    } catch (error) {

        console.error(
            "❌ Delete Charger Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to delete charger",

            error:
                error.message
        });
    }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    getChargerSummary,

    getChargers,

    getChargerById,

    createCharger,

    updateCharger,

    deleteCharger

};

