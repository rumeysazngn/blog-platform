"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
app_1.default.use("/api", routes_1.default);
app_1.default.listen(config_1.config.port, () => {
    BigInt.prototype.toJSON = function () {
        return this.toString();
    };
    console.log(`✅ Server running on http://localhost:${config_1.config.port}`);
    console.log(`📍 Health check: http://localhost:${config_1.config.port}/api/health`);
    console.log("AI URL:", process.env.AI_SERVICE_URL);
});
