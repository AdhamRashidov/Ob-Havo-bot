import RequestLog from "./requestLog.js";

const logRequests = async (req, res, next) => {
    await RequestLog.create({
        ip: req.ip,
        method: req.method,
        url: req.originalUrl
    });
    next();
};

export default logRequests;
