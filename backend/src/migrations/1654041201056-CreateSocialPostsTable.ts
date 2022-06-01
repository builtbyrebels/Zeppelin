import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateSocialPostsTable1654041201056 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: "social_posts",
          columns: [
            {
              name: "guild_id",
              type: "bigint",
              isPrimary: true,
            },
            {
              name: "platform",
              type: "varchar",
              length: "100",
              isPrimary: true,
            },
            {
              name: "path",
              type: "varchar",
              length: "100",
              isPrimary: true,
            },
            {
              name: "last_post",
              type: "bigint",
            },
          ],
        }
      ),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("social_posts");
  }
}
