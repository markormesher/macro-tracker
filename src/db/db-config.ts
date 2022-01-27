import { join } from "path";
import { ConnectionOptions } from "typeorm";
import { isDev } from "../utils/env";
import { getSecret } from "../config/config-loader";
import { PostgresNamingStrategy } from "./PostgresNamingStrategy";

const typeormConf: ConnectionOptions = {
  type: "postgres",
  logging: isDev() ? "all" : false,
  namingStrategy: new PostgresNamingStrategy(),
  host: "postgres_primary",
  username: "macro_tracker",
  password: getSecret("postgres.password"),
  database: "macro_tracker",
  entities: [join(__dirname, "models", "*.js")],
};

export { typeormConf };
