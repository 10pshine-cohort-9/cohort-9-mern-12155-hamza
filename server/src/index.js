import "dotenv/config";
import { app, connectDatabase } from "./app.js";
import logger from "./config/logger.js";

const rawPort = process.env.PORT;
const PORT = rawPort === undefined ? 5000 : Number(rawPort);

if (!Number.isInteger(PORT) || PORT < 0 || PORT > 65535) {
  logger.fatal({ port: rawPort }, "Invalid PORT value");
  process.exit(1);
}

await connectDatabase();

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server started");
});
