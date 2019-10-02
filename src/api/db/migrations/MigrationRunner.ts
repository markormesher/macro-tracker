import { ConnectionOptions, createConnection, QueryRunner } from "typeorm";
import { logger } from "../../../commons/utils/logging";
import { delayPromise } from "../../../commons/utils/utils";
import { allMigrations } from "./all-migrations";

/*

NOTE: the following migrations table that must be created BEFORE migrations can run.

CREATE TABLE migrations (
    migration_in_progress boolean DEFAULT false NOT NULL,
    last_migration integer DEFAULT '-1'::integer NOT NULL
);
INSERT INTO migrations VALUES (default, default);

 */

interface IMigrationsTableRow {
  readonly migration_in_progress: boolean;
  readonly last_migration: number;
}

class MigrationRunner {
  private connectionOptions: ConnectionOptions;

  constructor(connectionOptions: ConnectionOptions) {
    this.connectionOptions = connectionOptions;
  }

  public waitForMigrationsToComplete(): Promise<void> {
    return this.withQueryRunner(async (qr) => {
      // check that migrations table exists
      const table = await qr.getTable("migrations");
      if (!table) {
        throw new Error("Migration table doesn't exist!");
      }

      // busy-check for migration status
      let migrationInProgress: boolean;
      do {
        const migrationRows: IMigrationsTableRow[] = await qr.query("SELECT migration_in_progress FROM migrations;");
        if (migrationRows.length !== 1) {
          throw new Error("Migration table didn't contain exactly 1 row");
        }

        migrationInProgress = migrationRows[0].migration_in_progress;
        if (migrationInProgress) {
          logger.debug("Migrations still running, sleeping 5000ms...");
          await delayPromise(5000);
        }
      } while (migrationInProgress);
    });
  }

  public runMigrations(): Promise<void> {
    return this.withQueryRunner(async (qr) => {
      // check that migrations table exists
      const table = await qr.getTable("migrations");
      if (!table) {
        throw new Error("Migration table doesn't exist!");
      }

      // check that migrations aren't in progress already
      const migrationRows: IMigrationsTableRow[] = await qr.query("SELECT * FROM migrations;");
      if (migrationRows.length !== 1) {
        throw new Error("Migration table didn't contain exactly 1 row");
      }

      const migrationRow = migrationRows[0];
      if (migrationRow.migration_in_progress) {
        throw new Error("Migrations are already running. This probably means the last set of migrations failed.");
      }

      // mark migrations as in progress
      await qr.query("UPDATE migrations SET migration_in_progress = true;");

      // run outstanding migrations
      const lastMigration = migrationRow.last_migration;
      const outstandingMigrations = allMigrations.filter((m) => m.migrationNumber > lastMigration);
      for (const migration of outstandingMigrations) {
        logger.debug(`Running migration ${migration.migrationNumber}`);
        await qr.startTransaction();
        await migration.up(qr);
        await qr.query(`UPDATE migrations SET last_migration = ${migration.migrationNumber};`);
        await qr.commitTransaction();
      }

      // mark migrations as complete
      await qr.query("UPDATE migrations SET migration_in_progress = false;");
    });
  }

  private async withQueryRunner(exec: (qr: QueryRunner) => void): Promise<void> {
    const connection = await createConnection({ ...this.connectionOptions, synchronize: false });
    const qr = connection.createQueryRunner("master");

    try {
      await exec(qr);
      await qr.release();
      await connection.close();
    } catch (err) {
      await qr.release();
      await connection.close();
      throw err;
    }
  }
}

export { MigrationRunner };
