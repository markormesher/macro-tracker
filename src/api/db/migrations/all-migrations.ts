/* tslint:disable:no-trailing-whitespace max-line-length */
import { QueryRunner } from "typeorm";
import { PostgresNamingStrategy } from "../PostgresNamingStrategy";
import { IDbMigration } from "./IDbMigration";

const ns = new PostgresNamingStrategy();

const allMigrations: IDbMigration[] = [
	// create initial tables
	{
		migrationNumber: 1,
		up: (qr: QueryRunner) => {
			return qr.query(`
                CREATE TABLE IF NOT EXISTS db_diary_entry
                (
                    id              uuid    DEFAULT uuid_generate_v4() NOT NULL,
                    deleted         boolean DEFAULT false              NOT NULL,
                    date            integer                            NOT NULL,
                    last_edit       integer                            NOT NULL,
                    meal            character varying                  NOT NULL,
                    serving_qty     double precision                   NOT NULL,
                    food_item_id    uuid,
                    serving_size_id uuid
                );

                CREATE TABLE IF NOT EXISTS db_food_item
                (
                    id                   uuid    DEFAULT uuid_generate_v4() NOT NULL,
                    deleted              boolean DEFAULT false              NOT NULL,
                    brand                character varying                  NOT NULL,
                    name                 character varying                  NOT NULL,
                    measurement_unit     character varying                  NOT NULL,
                    calories_per_100     double precision                   NOT NULL,
                    carbohydrate_per_100 double precision                   NOT NULL,
                    sugar_per_100        double precision                   NOT NULL,
                    fat_per_100          double precision                   NOT NULL,
                    sat_fat_per_100      double precision                   NOT NULL,
                    protein_per_100      double precision                   NOT NULL,
                    fibre_per_100        double precision                   NOT NULL,
                    salt_per_100         double precision                   NOT NULL
                );

                CREATE TABLE IF NOT EXISTS db_serving_size
                (
                    id           uuid    DEFAULT uuid_generate_v4() NOT NULL,
                    deleted      boolean DEFAULT false              NOT NULL,
                    label        character varying                  NOT NULL,
                    measurement  double precision                   NOT NULL,
                    food_item_id uuid
                );

                ALTER TABLE db_diary_entry
                    OWNER TO macro_tracker;

                ALTER TABLE db_food_item
                    OWNER TO macro_tracker;

                ALTER TABLE db_serving_size
                    OWNER TO macro_tracker;

                ALTER TABLE ONLY db_food_item
                    ADD CONSTRAINT ${ns.primaryKeyName("db_food_item", ["id"])} PRIMARY KEY (id);

                ALTER TABLE ONLY db_diary_entry
                    ADD CONSTRAINT ${ns.primaryKeyName("db_diary_entry", ["id"])} PRIMARY KEY (id);

                ALTER TABLE ONLY db_serving_size
                    ADD CONSTRAINT ${ns.primaryKeyName("db_serving_size", ["id"])} PRIMARY KEY (id);

                ALTER TABLE ONLY db_diary_entry
                    ADD CONSTRAINT ${ns.foreignKeyName("db_diary_entry", ["serving_size_id"])}
                        FOREIGN KEY (serving_size_id) REFERENCES db_serving_size (id);

                ALTER TABLE ONLY db_diary_entry
                    ADD CONSTRAINT ${ns.foreignKeyName("db_diary_entry", ["food_item_id"])}
                        FOREIGN KEY (food_item_id) REFERENCES db_food_item (id);

                ALTER TABLE ONLY db_serving_size
                    ADD CONSTRAINT ${ns.foreignKeyName("db_serving_size", ["food_item_id"])}
                        FOREIGN KEY (food_item_id) REFERENCES db_food_item (id);
			`);
		},
		down: (qr: QueryRunner) => {
			return qr.query(`
                DROP TABLE IF EXISTS db_diary_entry;
                DROP TABLE IF EXISTS db_food_item;
                DROP TABLE IF EXISTS db_serving_size;
			`);
		},
	},

	// add target table
	{
		migrationNumber: 2,
		up: (qr: QueryRunner) => {
			return qr.query(`
                CREATE TABLE IF NOT EXISTS db_target
                (
                    id                        uuid    DEFAULT uuid_generate_v4() NOT NULL,
                    deleted                   boolean DEFAULT false              NOT NULL,
                    baseline_calories_per_day double precision                   NOT NULL,
                    proportion_carbohydrates  double precision                   NOT NULL,
                    proportion_protein        double precision                   NOT NULL,
                    proportion_fat            double precision                   NOT NULL,
                    start_date                integer                            NOT NULL
                );

                ALTER TABLE ONLY db_target
                    ADD CONSTRAINT ${ns.primaryKeyName("db_target", ["id"])} PRIMARY KEY (id);

                ALTER TABLE db_target
                    OWNER TO macro_tracker;
			`);
		},
		down: (qr: QueryRunner) => {
			return qr.query(`
                DROP TABLE IF EXISTS db_target;
			`);
		},
	},

	// add exercise entry table
	{
		migrationNumber: 3,
		up: (qr: QueryRunner) => {
			return qr.query(`
                CREATE TABLE IF NOT EXISTS db_exercise_entry
                (
					id              uuid    DEFAULT uuid_generate_v4() NOT NULL,
					deleted         boolean DEFAULT false              NOT NULL,
					date            integer                            NOT NULL,
					last_edit       integer                            NOT NULL,
					label           character varying                  NOT NULL,
					calories_burned double precision                   NOT NULL
                );

                ALTER TABLE ONLY db_exercise_entry
                    ADD CONSTRAINT ${ns.primaryKeyName("db_exercise_entry", ["id"])} PRIMARY KEY (id);

                ALTER TABLE db_exercise_entry
                    OWNER TO macro_tracker;
			`);
		},
		down: (qr: QueryRunner) => {
			return qr.query(`
                DROP TABLE IF EXISTS db_exercise_entry;
			`);
		},
	},

	// add user table
	{
		migrationNumber: 4,
		up: (qr: QueryRunner) => {
			return qr.query(`
                CREATE TABLE IF NOT EXISTS db_user
                (
					id           uuid    DEFAULT uuid_generate_v4() NOT NULL,
					deleted      boolean DEFAULT false              NOT NULL,
					google_id    character varying                  NOT NULL,
					display_name character varying                  NOT NULL
                );

                ALTER TABLE ONLY db_user
                    ADD CONSTRAINT ${ns.primaryKeyName("db_user", ["id"])} PRIMARY KEY (id);

                ALTER TABLE db_user
                    OWNER TO macro_tracker;
			`);
		},
		down: (qr: QueryRunner) => {
			return qr.query(`
                DROP TABLE IF EXISTS db_user;
			`);
		},
	},

	// add food item UPC
	{
		migrationNumber: 5,
		up: (qr: QueryRunner) => {
			return qr.query(`
				ALTER TABLE db_food_item ADD COLUMN upc CHARACTER VARYING;
			`);
		},
		down: (qr: QueryRunner) => {
			return qr.query(`
				ALTER TABLE db_food_item DROP COLUMN upc;
			`);
		},
	},
];

export {
	allMigrations,
};
