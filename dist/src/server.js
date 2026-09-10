import app from "./app";
const PORT = 5000;
const main = () => {
    try {
        await prisma;
        app.listen(PORT, () => {
            console.log(`Server is running on port: http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1);
    }
};
main();
