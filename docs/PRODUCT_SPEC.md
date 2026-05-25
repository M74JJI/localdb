# Product Specification

## Product name

LocalDB Hub

## One-line definition

A portable self-hosted database control center that lets developers create and manage local databases from one clean web dashboard.

## Primary user flows

1. Install LocalDB Hub.
2. Open `http://SERVER-IP:8080`.
3. Create admin account.
4. Click **Create Database**.
5. Select database engine and version.
6. Choose name, database name, port mode, expose mode, and resources.
7. LocalDB Hub creates the database container or file.
8. User copies the generated connection string.

## Supported distribution modes

1. Docker Compose package.
2. Debian/Ubuntu install script.
3. Ready VM image.

## V1 engine support

- PostgreSQL
- MySQL
- MariaDB
- MongoDB
- Redis
- SQLite

## Core features

- First-run admin setup.
- Login/logout.
- Template catalog.
- Create database instance.
- Start/stop/restart/delete instance.
- Delete instance with or without data.
- Connection string generation.
- Logs viewer.
- Manual backup.
- Manual restore.
- Health status.
- Port conflict detection.
- Job progress tracking.
- Audit logs.
