-- AlterTable
ALTER TABLE "categories" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "categories" ALTER COLUMN "type" DROP NOT NULL;

-- Seed initial categories
INSERT INTO "categories" ("id", "name", "type", "description", "isActive", "createdAt", "updatedAt")
VALUES
    ('category_office_supply', '事務的（日用品）', 'OFFICE_SUPPLY', '備品・消耗品の購入依頼', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('category_improvement', '改善要望', 'IMPROVEMENT', 'オフィス環境や社内運用の改善リクエスト', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("type") DO UPDATE SET
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;
