import { Connection, ConnectionOptions, createConnection, QueryRunner, Table } from "typeorm";
import { logger } from "../../../commons/utils/logging";
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
		return this.withQueryRunner((qr) => qr
				.getTable("migrations")
				.then((table?: Table) => {
					// check that migrations table exists
					if (!table) {
						throw new Error("Migration table doesn't exist!");
					}
				})
				.then(() => {
					// busy-check for migration status
					const checkForMigrationStatus = (resolve: () => void, reject: (err?: any) => void) => {
						qr.query("SELECT migration_in_progress FROM migrations;")
								.then((results: IMigrationsTableRow[]) => {
									if (results.length !== 1) {
										reject(new Error("Migration table didn't contain exactly 1 row"));
									}

									if (results[0].migration_in_progress) {
										logger.debug("Migrations still running, sleeping 5000ms...");
										setTimeout(() => checkForMigrationStatus(resolve, reject), 5000);
									} else {
										resolve();
									}
								});
					};

					return new Promise((resolve, reject) => checkForMigrationStatus(resolve, reject));
				}),
		);
	}

	public runMigrations(): Promise<void> {
		return this.withQueryRunner((qr) => qr
				.getTable("migrations")
				.then((table?: Table) => {
					// check that migrations table exists
					if (!table) {
						throw new Error("Migration table doesn't exist!");
					}
				})
				.then(() => {
					// check that migrations aren't in progress already
					return qr
							.query("SELECT migration_in_progress FROM migrations;")
							.then((results: IMigrationsTableRow[]) => {
								if (results.length !== 1) {
									throw new Error("Migration table didn't contain exactly 1 row");
								}

								if (results[0].migration_in_progress) {
									throw new Error("Migrations are already running. This probably means the last set of migrations failed.");
								}
							});
				})
				.then(() => {
					return qr.query("UPDATE migrations SET migration_in_progress = true;");
				})
				.then(() => {
					// get the latest migration
					return qr
							.query("SELECT last_migration FROM migrations;")
							.then((results: IMigrationsTableRow[]) => {
								if (results.length !== 1) {
									throw new Error("Migration table didn't contain exactly 1 row");
								}

								return results[0].last_migration;
							});
				})
				.then((lastMigration) => {
					const outstandingMigrations = allMigrations.filter((m) => m.migrationNumber > lastMigration);

					const runNextMigration = (resolve: () => void, reject: (err?: any) => void) => {
						if (outstandingMigrations.length === 0) {
							resolve();
							return;
						}

						const migration = outstandingMigrations.shift();
						logger.debug(`Running migration ${migration.migrationNumber}`);
						qr.startTransaction()
								.then(() => migration.up(qr))
								.then(() => qr.query(`UPDATE migrations SET last_migration = ${migration.migrationNumber};`))
								.then(() => qr.commitTransaction())
								.then(() => runNextMigration(resolve, reject))
								.catch(reject);
					};

					return new Promise((resolve, reject) => runNextMigration(resolve, reject));
				})
				.then(() => {
					return qr.query("UPDATE migrations SET migration_in_progress = false;");
				}),
		);
	}

	private withQueryRunner(exec: (qr: QueryRunner) => void): Promise<void> {
		let connection: Connection;
		let qr: QueryRunner;

		return createConnection({ ...this.connectionOptions, synchronize: false })
				.then((c) => {
					connection = c;
					qr = connection.createQueryRunner("master");
					return exec(qr);
				})
				.then(() => {
					return qr.release().then(() => connection.close());
				})
				.catch((err) => {
					return qr.release().then(() => connection.close()).then(() => {
						throw err;
					});
				});
	}
}

export {
	MigrationRunner,
};
