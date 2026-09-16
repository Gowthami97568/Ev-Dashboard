const legacyLogUrl =
    "http://server.evchargeman.com:5679/logs";

const decodeHtml = (value) => value
    .replace(/<br\s*\/?>(?=\s*)/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const getServiceFromMessage = (message) => {
    if (/heartbeat data received/i.test(message)) {
        return "Heartbeat";
    }

    if (/long run transactions/i.test(message)) {
        return "Transaction Service";
    }

    return "Charger Communication";
};

const getStatusFromLevel = (level) => {
    if (level === "WARN") {
        return "Warning";
    }

    if (level === "ERROR") {
        return "Failed";
    }

    return "Success";
};

const parseLogRows = (html) => {
    const rows = [];
    const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;

    while ((rowMatch = rowPattern.exec(html)) !== null) {
        const cells = [];
        const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        let cellMatch;

        while ((cellMatch = cellPattern.exec(rowMatch[1])) !== null) {
            cells.push(decodeHtml(cellMatch[1]));
        }

        if (cells.length < 3 || !/^(info|warn|error)$/i.test(cells[0])) {
            continue;
        }

        const level = cells[0].toUpperCase();

        rows.push({
            id: rows.length + 1,
            level,
            service: getServiceFromMessage(cells[2]),
            message: cells[2],
            status: getStatusFromLevel(level),
            timestamp: cells[1]
        });
    }

    return rows;
};

const getServerLogs = async (req, res) => {
    try {
        const response = await fetch(legacyLogUrl);

        if (!response.ok) {
            throw new Error(`Legacy log source returned ${response.status}`);
        }

        const logs = parseLogRows(await response.text());

        res.json({
            success: true,
            message: "Server logs fetched successfully",
            data: logs
        });
    } catch (error) {
        console.error("Server Logs Error:", error);

        res.status(502).json({
            success: false,
            message: "Failed to fetch server logs",
            error: error.message
        });
    }
};

module.exports = {
    getServerLogs
};