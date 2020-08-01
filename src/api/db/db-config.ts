import { join } from "path";
import { ConnectionOptions } from "typeorm";
import { isDev, isTest } from "../../commons/utils/env";
import { getSecret } from "../config/config-loader";
import { PostgresNamingStrategy } from "./PostgresNamingStrategy";

const typeormConf: ConnectionOptions = {
  type: "postgres",
  logging: isDev() ? "all" : false,
  namingStrategy: new PostgresNamingStrategy(),
  replication: {
    master: {
      host: "postgres_primary",
      username: "macro_tracker",
      password: getSecret("postgres.password"),
      database: isTest() ? "macro_tracker_test" : "macro_tracker",
    },
    slaves: [
      {
        host: "postgres_replica_1",
        username: "macro_tracker",
        password: getSecret("postgres.password"),
        database: isTest() ? "macro_tracker_test" : "macro_tracker",
      },
      {
        host: "postgres_replica_2",
        username: "macro_tracker",
        password: getSecret("postgres.password"),
        database: isTest() ? "macro_tracker_test" : "macro_tracker",
      },
    ],
  },
  entities: [join(__dirname, "models", "*.js")],
};

export { typeormConf };
