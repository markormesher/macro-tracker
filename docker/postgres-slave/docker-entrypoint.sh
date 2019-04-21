#!/usr/bin/env bash
set -euo pipefail
POSTGRES_REP_PASSWORD=$(cat "$POSTGRES_REP_PASSWORD_FILE")

if [[ ! -s "$PGDATA/PG_VERSION" ]]; then
    echo "*:*:*:$POSTGRES_REP_USER:$POSTGRES_REP_PASSWORD" > ~/.pgpass
    chmod 0600 ~/.pgpass
    until ping -c 1 -W 1 postgres_master; do
        echo "Waiting for master to ping..."
        sleep 2s
    done

    until pg_basebackup -h postgres_master -D $PGDATA -U $POSTGRES_REP_USER -vP -W; do
        echo "Waiting for master to connect..."
        sleep 2s
    done

    echo "host replication all 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"
    cat > ${PGDATA}/recovery.conf <<EOF
standby_mode = on
primary_conninfo = 'host=postgres_master port=5432 user=$POSTGRES_REP_USER password=$POSTGRES_REP_PASSWORD'
trigger_file = '/tmp/touch_me_to_promote_to_me_master'
EOF
    chown -R postgres. "$PGDATA"
    chmod -R 700 "$PGDATA"
fi

sed -i 's/wal_level = .*/wal_level = replica/' "$PGDATA/postgresql.conf"

exec "$@"
