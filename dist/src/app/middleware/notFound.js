import httpStatus from "http-status";
export const notFound = (req, res) => {
    return res.status(httpStatus.NOT_FOUND).json({
        message: "Router is Not Found",
        path: req.originalUrl,
        date: new Date()
    });
};
