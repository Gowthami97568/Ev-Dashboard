const crypto = require("crypto");

const safeCompare = (providedValue, expectedValue) => {
    const provided = Buffer.from(String(providedValue || ""));
    const expected = Buffer.from(String(expectedValue || ""));

    return provided.length === expected.length &&
        crypto.timingSafeEqual(provided, expected);
};

const TOKEN_TTL_SECONDS = 8 * 60 * 60;

const getAuthSecret = () => {
    if (!process.env.AUTH_SECRET) {
        throw new Error("AUTH_SECRET is not configured");
    }

    return process.env.AUTH_SECRET;
};

const login = (req, res) => {
    const { username, password } = req.body || {};
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || (!adminPassword && !process.env.ADMIN_PASSWORD_HASH)) {
        return res.status(503).json({
            success: false,
            message: "Admin login is not configured"
        });
    }

    if (!safeCompare(username, adminUsername) || !verifyPassword(password)) {
        return res.status(401).json({
            success: false,
            message: "Invalid admin credentials"
        });
    }

    res.json({
        success: true,
        message: "Admin login successful",
        data: {
            username: adminUsername,
            token: createToken(adminUsername),
            expiresIn: TOKEN_TTL_SECONDS
        }
    });
};

const verifyPassword = (password) => {
    const configuredHash = process.env.ADMIN_PASSWORD_HASH;

    if (!configuredHash) {
        return safeCompare(password, process.env.ADMIN_PASSWORD);
    }

    const [algorithm, salt, expectedHash] = configuredHash.split("$");

    if (algorithm !== "scrypt" || !salt || !expectedHash) {
        return false;
    }

    const actualHash = crypto.scryptSync(String(password || ""), salt, 64).toString("hex");
    return safeCompare(actualHash, expectedHash);
};

const createToken = (username) => {
    const payload = Buffer.from(JSON.stringify({
        sub: username,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
    })).toString("base64url");
    const signature = crypto.createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");

    return `${payload}.${signature}`;
};

module.exports = {
    login
};