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

const getServerLogs = async (req, res) => {
    try {
        const response = await fetch(legacyLogUrl);

        if (!response.ok) {
            throw new Error(`Legacy log source returned ${response.status}`);
        }

        const html = await response.text();
        const logs = [];
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

            logs.push({
                id: logs.length + 1,
                level,
                message: cells[2],
                timestamp: cells[1],
                status: level === "WARN"
                    ? "Warning"
                    : level === "ERROR"
                        ? "Failed"
                        : "Success"
            });
        }

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