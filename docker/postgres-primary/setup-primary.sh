#!/usr/bin/env bash
set -euo pipefail
POSTGRES_REP_PASSWORD=$(cat "$POSTGRES_REP_PASSWORD_FILE")

# add replication user to PG HBA
echo "host replication all all md5" >> "$PGDATA/pg_hba.conf"

# add replication user to DB itself
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE USER $POSTGRES_REP_USER REPLICATION LOGIN CONNECTION LIMIT 100 ENCRYPTED PASSWORD '$POSTGRES_REP_PASSWORD';
EOSQL

setConfig() {
    key="$1"
    val="$2"
    if grep -q "^$key = " "$PGDATA/postgresql.conf"; then
        sed -i "s/^$key = .*/$key = $val/" "$PGDATA/postgresql.conf"
    else
        echo "$key = $val" >> "$PGDATA/postgresql.conf"
    fi
}

# setup config
setConfig "wal_level" "hot_standby"
setConfig "archive_mode" "on"
setConfig "archive_command" "'cd .'"
setConfig "max_wal_senders" "8"
setConfig "wal_keep_segments" "8"
setConfig "hot_standby" "on"
