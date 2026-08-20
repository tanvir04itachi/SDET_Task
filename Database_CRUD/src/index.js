const { initDb } = require("./config/db");
const { close } = require("./utils/prompt");
const mainMenu = require("./menus/mainMenu");

async function start() {
  try {
    await initDb();
    console.log("Connected to database and ready.");
    await mainMenu();
  } catch (err) {
    console.error("Failed to start application:", err.message);
  } finally {
    close();
    process.exit(0);
  }
}

start();
