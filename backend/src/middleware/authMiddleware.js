const crypto = require("crypto");

const unauthorized = (res) => res.status(401).json({
    success: false,
    message: "Authentication required"
});

const requireAuth = (req, res, next) => {
    const header = req.get("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const [payload, signature] = token.split(".");

    if (!payload || !signature || !process.env.AUTH_SECRET) {
        return unauthorized(res);
    }

    const expectedSignature = crypto.createHmac("sha256", process.env.AUTH_SECRET)
        .update(payload)
        .digest("base64url");
    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (providedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
        return unauthorized(res);
    }

    try {
        const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

        if (!claims.sub || !claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) {
            return unauthorized(res);
        }

        req.admin = claims;
        return next();
    } catch {
        return unauthorized(res);
    }
};

module.exports = {
    requireAuth
};
