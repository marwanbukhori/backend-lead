import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1704771600000 implements MigrationInterface {
    name = 'InitialSchema1704771600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" VARCHAR(255) UNIQUE NOT NULL,
                "password_hash" VARCHAR(255) NOT NULL,
                "name" VARCHAR(255),
                "role" VARCHAR(50) DEFAULT 'user',
                "last_login" TIMESTAMP,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Documents table
        await queryRunner.query(`
            CREATE TABLE "documents" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" VARCHAR(255) NOT NULL,
                "content" TEXT NOT NULL,
                "path" VARCHAR(255) UNIQUE NOT NULL,
                "metadata" JSONB DEFAULT '{}',
                "tags" TEXT[] DEFAULT '{}',
                "views" INTEGER DEFAULT 0,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Bookmarks table
        await queryRunner.query(`
            CREATE TABLE "bookmarks" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" UUID REFERENCES "users"(id) ON DELETE CASCADE,
                "document_id" UUID REFERENCES "documents"(id) ON DELETE CASCADE,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, document_id)
            )
        `);

        // Reading Progress table
        await queryRunner.query(`
            CREATE TABLE "reading_progress" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" UUID REFERENCES "users"(id) ON DELETE CASCADE,
                "document_id" UUID REFERENCES "documents"(id) ON DELETE CASCADE,
                "progress" INTEGER DEFAULT 0,
                "last_read_at" TIMESTAMP,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, document_id)
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_documents_path" ON "documents"("path")`);
        await queryRunner.query(`CREATE INDEX "idx_documents_tags" ON "documents" USING gin("tags")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "reading_progress"`);
        await queryRunner.query(`DROP TABLE "bookmarks"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP EXTENSION "uuid-ossp"`);
    }
}
