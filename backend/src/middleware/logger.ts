const logger = (req: any, res: any, next: any) => {
    console.log(
        `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}\n`
    );
    next();
}

export default logger;
