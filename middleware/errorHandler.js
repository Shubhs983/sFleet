const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: err.message || "Something went wrong on the server!"
    });
};

module.exports = errorHandler;