import dotenv from 'dotenv';
dotenv.config();

import {connectDatabase} from "./config/database";
import app from "./app";


const PORT = process.env.PORT || 3000;


async function startServer() {
    try {
        await connectDatabase();
        console.log("Database Connected");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        })
    }
    catch (error) {
        console.error('Failed to start server: ' + error);
        process.exit(1);
    }
}

startServer();