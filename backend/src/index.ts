import app from './app';
import { config } from './config';
import routes from "./routes";

app.use("/api", routes);
app.listen(config.port, () => {
  (BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

  console.log(`✅ Server running on http://localhost:${config.port}`);
  console.log(`📍 Health check: http://localhost:${config.port}/api/health`);
  console.log("AI URL:", process.env.AI_SERVICE_URL);

});