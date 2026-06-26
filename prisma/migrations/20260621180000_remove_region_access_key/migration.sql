-- DropRegionAccessKey
DROP INDEX IF EXISTS "antennes_regionales_accessKey_key";

ALTER TABLE "antennes_regionales" DROP COLUMN IF EXISTS "accessKey";
