const pool = require("../config/db");

const MODULES = new Map([
    ["all", "All"],
    ["dashboard", "Dashboard"],
    ["user", "User"],
    ["wallet", "Wallet"],
    ["chargemaster", "chargeMaster"],
    ["transaction", "Transaction"],
    ["device", "Device"],
    ["settings", "Settings"],
    ["accountinfo", "AccountInfo"],
    ["appversion", "AppVersion"],
    ["devicelogs", "DeviceLogs"],
    ["serverlogs", "ServerLogs"],
    ["configdata", "ConfigData"],
    ["socketinfo", "SocketInfo"],
    ["analytics", "Analytics"],
    ["logs", "Logs"]
]);

let permissionTablePromise;

const quoteIdentifier = identifier => `\`${identifier.replace(/`/g, "``")}\``;

const findOrCreatePermissionTable = async () => {
    const [columns] = await pool.query(
        `SELECT TABLE_NAME, COLUMN_NAME
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
         ORDER BY TABLE_NAME`
    );
    const tables = new Map();

    for (const column of columns) {
        const tableName = column.TABLE_NAME;
        const tableColumns = tables.get(tableName) || new Map();
        tableColumns.set(String(column.COLUMN_NAME).toLowerCase(), column.COLUMN_NAME);
        tables.set(tableName, tableColumns);
    }

    const compatible = [...tables.entries()]
        .filter(([, tableColumns]) =>
            tableColumns.has("userid") && tableColumns.has("permission_map")
        )
        .sort(([left], [right]) => {
            if (left.toLowerCase() === "user_permissions") return -1;
            if (right.toLowerCase() === "user_permissions") return 1;
            return left.localeCompare(right);
        })[0];

    if (compatible) {
        return {
            table: quoteIdentifier(compatible[0]),
            userId: quoteIdentifier(compatible[1].get("userid")),
            permissionMap: quoteIdentifier(compatible[1].get("permission_map"))
        };
    }

    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_permissions (
            userId VARCHAR(191) NOT NULL PRIMARY KEY,
            Permission_Map TEXT NOT NULL
        )
    `);

    return {
        table: "`user_permissions`",
        userId: "`userId`",
        permissionMap: "`Permission_Map`"
    };
};

const getPermissionTable = async () => {
    if (!permissionTablePromise) {
        permissionTablePromise = findOrCreatePermissionTable().catch(error => {
            permissionTablePromise = undefined;
            throw error;
        });
    }

    return permissionTablePromise;
};

const ensureConfiguredAdministratorPermission = async (table, userId, permissionMap, authenticatedUserId) => {
    if (
        authenticatedUserId.toLowerCase() !==
        String(process.env.ADMIN_USERNAME || "").toLowerCase()
    ) {
        return;
    }

    const [rows] = await pool.query(
        `SELECT 1 FROM ${table} WHERE ${userId} = ? LIMIT 1`,
        [authenticatedUserId]
    );

    if (rows.length === 0) {
        await pool.query(
            `INSERT INTO ${table} (${userId}, ${permissionMap}) VALUES (?, ?)`,
            [authenticatedUserId, "allow:All"]
        );
    }
};

const normalizePermissionMap = permissionMap => {
    if (typeof permissionMap !== "string") {
        return null;
    }

    const normalized = [];
    const seen = new Set();

    for (const rawPermission of permissionMap.split(",")) {
        const token = rawPermission.trim().replace(/\s+/g, "");
        if (!token) continue;

        const match = /^(allow|view):([A-Za-z][A-Za-z0-9_-]*)$/i.exec(token);
        if (!match) return null;

        const action = match[1].toLowerCase();
        const moduleKey = match[2].replace(/[^a-z0-9]/gi, "").toLowerCase();
        const moduleName = MODULES.get(moduleKey);
        if (!moduleName || (moduleName === "All" && action !== "allow")) {
            return null;
        }

        const canonical = `${action}:${moduleName}`;
        const dedupeKey = canonical.toLowerCase();
        if (!seen.has(dedupeKey)) {
            normalized.push(canonical);
            seen.add(dedupeKey);
        }
    }

    if (seen.has("allow:all")) {
        return "allow:All";
    }

    return normalized.join(",");
};

const requirePermissionAdministrator = (req, res, next) => {
    const configuredAdmin = process.env.ADMIN_USERNAME;
    if (!configuredAdmin) {
        return res.status(503).json({
            success: false,
            message: "Permission administration is not configured"
        });
    }

    if (String(req.admin?.sub || "").toLowerCase() !== configuredAdmin.toLowerCase()) {
        return res.status(403).json({
            success: false,
            message: "Administrator access is required"
        });
    }

    return next();
};

const getPermissionRows = async (req, res) => {
    try {
        const { table, userId, permissionMap } = await getPermissionTable();
        const authenticatedUserId = String(req.admin?.sub || "").trim();

        if (!authenticatedUserId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user ID is missing"
            });
        }

        const isAdministrator = authenticatedUserId.toLowerCase() ===
            String(process.env.ADMIN_USERNAME || "").toLowerCase();
        if (isAdministrator) {
            await ensureConfiguredAdministratorPermission(
                table,
                userId,
                permissionMap,
                authenticatedUserId
            );
        }

        const [rows] = isAdministrator
            ? await pool.query(
                `SELECT ${userId} AS UserId, ${permissionMap} AS Permission_Map
                 FROM ${table}
                 ORDER BY ${userId}`
            )
            : await pool.query(
                `SELECT ${userId} AS UserId, ${permissionMap} AS Permission_Map
                 FROM ${table}
                 WHERE ${userId} = ?
                 LIMIT 1`,
                [authenticatedUserId]
            );

        return res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Permission list error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load user permissions"
        });
    }
};

const upsertPermissions = async (req, res) => {
    try {
        const { table, userId: userIdColumn, permissionMap: permissionMapColumn } =
            await getPermissionTable();
        const userId = String(req.params.userId || "").trim();
        const permissionMap = normalizePermissionMap(req.body?.Permission_Map);

        if (!userId || userId.length > 191) {
            return res.status(400).json({
                success: false,
                message: "A valid UserId is required"
            });
        }

        if (permissionMap === null) {
            return res.status(400).json({
                success: false,
                message: "Permission_Map contains an invalid or unsupported permission"
            });
        }

        if (
            userId.toLowerCase() === String(process.env.ADMIN_USERNAME || "").toLowerCase() &&
            permissionMap !== "allow:All"
        ) {
            return res.status(400).json({
                success: false,
                message: "The configured administrator must retain allow:All"
            });
        }

        const [existingRows] = await pool.query(
            `SELECT 1 FROM ${table} WHERE ${userIdColumn} = ? LIMIT 1`,
            [userId]
        );

        if (existingRows.length > 0) {
            await pool.query(
                `UPDATE ${table} SET ${permissionMapColumn} = ? WHERE ${userIdColumn} = ?`,
                [permissionMap, userId]
            );
        } else {
            await pool.query(
                `INSERT INTO ${table} (${userIdColumn}, ${permissionMapColumn}) VALUES (?, ?)`,
                [userId, permissionMap]
            );
        }

        return res.json({
            success: true,
            message: "User permissions saved",
            data: {
                UserId: userId,
                Permission_Map: permissionMap
            }
        });
    } catch (error) {
        console.error("Permission save error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save user permissions"
        });
    }
};

const requireModulePermission = moduleName => async (req, res, next) => {
    try {
        const userId = String(req.admin?.sub || "").trim();
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user ID is missing"
            });
        }

        const { table, userId: userIdColumn, permissionMap } = await getPermissionTable();
        const [rows] = await pool.query(
            `SELECT ${permissionMap} AS Permission_Map
             FROM ${table}
             WHERE ${userIdColumn} = ?
             LIMIT 1`,
            [userId]
        );
        const permissions = normalizePermissionMap(rows[0]?.Permission_Map || "");
        const allowed = permissions !== null && permissions
            .split(",")
            .some(permission =>
                permission.toLowerCase() === "allow:all" ||
                permission.toLowerCase() === `allow:${moduleName.toLowerCase()}`
            );

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "Edit permission is required"
            });
        }

        return next();
    } catch (error) {
        console.error(`Permission check error for ${moduleName}:`, error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify edit permission"
        });
    }
};

module.exports = {
    getPermissionRows,
    upsertPermissions,
    requirePermissionAdministrator,
    requireModulePermission,
    normalizePermissionMap
};
