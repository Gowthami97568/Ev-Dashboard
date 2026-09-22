const crypto = require("crypto");

const TOKEN_TTL_SECONDS = 8 * 60 * 60;

/**
 * Safely compare two values.
 * Prevents timing attacks and handles empty values safely.
 */
const safeCompare = (providedValue, expectedValue) => {
    const provided = Buffer.from(String(providedValue ?? ""));
    const expected = Buffer.from(String(expectedValue ?? ""));

    if (provided.length !== expected.length) {
        return false;
    }

    return crypto.timingSafeEqual(provided, expected);
};

/**
 * Get authentication secret.
 */
const getAuthSecret = () => {
    const authSecret = process.env.AUTH_SECRET;

    if (!authSecret) {
        throw new Error("AUTH_SECRET is not configured");
    }

    return authSecret;
};

/**
 * Verify password against the configured scrypt hash.
 *
 * Expected format:
 * scrypt$<salt>$<hash>
 */
const verifyPassword = (password, configuredHash) => {
    if (!configuredHash) {
        return false;
    }

    const parts = String(configuredHash).split("$");

    if (parts.length !== 3) {
        return false;
    }

    const [algorithm, salt, expectedHash] = parts;

    if (
        algorithm !== "scrypt" ||
        !salt ||
        !expectedHash
    ) {
        return false;
    }

    try {
        const actualHash = crypto
            .scryptSync(
                String(password ?? ""),
                salt,
                64
            )
            .toString("hex");

        return safeCompare(actualHash, expectedHash);
    } catch (error) {
        console.error("Password verification failed:", error.message);
        return false;
    }
};

/**
 * Admin login.
 */
const login = (req, res) => {
    try {
        const { username, password } = req.body || {};

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
        const authSecret = process.env.AUTH_SECRET;

        /*
         * SAFE DIAGNOSTIC LOGGING
         *
         * This only prints whether variables exist and their lengths.
         * It NEVER prints passwords, password hashes, or secrets.
         */
        console.log("=== AUTH CONFIG CHECK ===");
        console.log(
            "ADMIN_USERNAME configured:",
            Boolean(adminUsername)
        );
        console.log(
            "ADMIN_PASSWORD_HASH configured:",
            Boolean(adminPasswordHash)
        );
        console.log(
            "AUTH_SECRET configured:",
            Boolean(authSecret)
        );
        console.log(
            "ADMIN_USERNAME length:",
            adminUsername ? adminUsername.length : 0
        );
        console.log(
            "ADMIN_PASSWORD_HASH length:",
            adminPasswordHash ? adminPasswordHash.length : 0
        );
        console.log(
            "AUTH_SECRET length:",
            authSecret ? authSecret.length : 0
        );
        console.log("=========================");

        /*
         * Check production authentication configuration.
         */
        if (
            !adminUsername ||
            !adminPasswordHash ||
            !authSecret
        ) {
            return res.status(503).json({
                success: false,
                message: "Admin login is not configured"
            });
        }

        /*
         * Validate username and password.
         */
        const usernameValid = safeCompare(
            username,
            adminUsername
        );

        const passwordValid = verifyPassword(
            password,
            adminPasswordHash
        );

        if (!usernameValid || !passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        /*
         * Create authentication token.
         */
        const token = createToken(adminUsername);

        return res.json({
            success: true,
            message: "Admin login successful",
            data: {
                username: adminUsername,
                token,
                expiresIn: TOKEN_TTL_SECONDS
            }
        });

    } catch (error) {
        console.error(
            "Admin login error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Create authentication token.
 *
 * Format:
 * base64url(payload).base64url(signature)
 */
const createToken = (username) => {
    const payload = Buffer
        .from(
            JSON.stringify({
                sub: username,
                exp:
                    Math.floor(Date.now() / 1000) +
                    TOKEN_TTL_SECONDS
            })
        )
        .toString("base64url");

    const signature = crypto
        .createHmac(
            "sha256",
            getAuthSecret()
        )
        .update(payload)
        .digest("base64url");

    return `${payload}.${signature}`;
};

module.exports = {
    login
};