import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1736653506627 implements MigrationInterface {
    name = 'InitialSchema1736653506627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing btree index if it exists
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_07eebd53dc7fd229e6df9c4fb9"`);

        // Create GiST index for search_vector
        await queryRunner.query(`CREATE INDEX "IDX_document_search_vector" ON "documents" USING GiST (search_vector)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_document_search_vector"`);
    }
}
