export function logRequests(req, res, next) {
    const startedAt = Date.now();
    res.on("finish", () => {
        const elapsed = Date.now() - startedAt;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${elapsed}ms)`);
    });
    next();
}
