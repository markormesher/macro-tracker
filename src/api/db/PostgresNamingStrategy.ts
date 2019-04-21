import { DefaultNamingStrategy, Table } from "typeorm";
import { snakeCase } from "typeorm/util/StringUtils";

// replaces names from the default strategy to make them postgres-safe (i.e. lower/snake case)
class PostgresNamingStrategy extends DefaultNamingStrategy {

	private static numberAwareSnakeCase(str: string): string {
		return snakeCase(str)
				.replace(/([0-9])([^_0-9])/g, "$1_$2")
				.replace(/([^_0-9])([0-9])/g, "$1_$2");
	}

	public name = "PostgresNamingStrategy";

	public columnName(propertyName: string, customName: string | undefined, embeddedPrefixes: string[]): string {
		const prefix = embeddedPrefixes.map((p) => PostgresNamingStrategy.numberAwareSnakeCase(p)).join("_");
		return prefix + (customName ? customName : PostgresNamingStrategy.numberAwareSnakeCase(propertyName));
	}

	public joinColumnName(relationName: string, referencedColumnName: string): string {
		return PostgresNamingStrategy.numberAwareSnakeCase(super.joinColumnName(relationName, referencedColumnName));
	}

	public joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
		return PostgresNamingStrategy.numberAwareSnakeCase(super.joinTableColumnName(tableName, propertyName, columnName));
	}

	public relationName(propertyName: string): string {
		return PostgresNamingStrategy.numberAwareSnakeCase(propertyName);
	}

	public primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
		return super.primaryKeyName(tableOrName, columnNames).toLowerCase();
	}

	public foreignKeyName(tableOrName: Table | string, columnNames: string[]): string {
		return super.foreignKeyName(tableOrName, columnNames).toLowerCase();
	}

	public indexName(tableOrName: Table | string, columns: string[], where?: string): string {
		return super.indexName(tableOrName, columns, where).toLowerCase();
	}

	public uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string {
		return super.uniqueConstraintName(tableOrName, columnNames).toLowerCase();
	}

	public relationConstraintName(tableOrName: Table | string, columnNames: string[], where?: string): string {
		return super.relationConstraintName(tableOrName, columnNames, where).toLowerCase();
	}

	public defaultConstraintName(tableOrName: Table | string, columnName: string): string {
		return super.defaultConstraintName(tableOrName, columnName).toLowerCase();
	}

	public checkConstraintName(tableOrName: Table | string, expression: string): string {
		return super.checkConstraintName(tableOrName, expression).toLowerCase();
	}
}

export {
	PostgresNamingStrategy,
};
