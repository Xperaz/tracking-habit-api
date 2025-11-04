-- Rename the typo'd columns to correct IDs
ALTER TABLE "habits" RENAME COLUMN "is" TO "id";
ALTER TABLE "habitTags" RENAME COLUMN "is" TO "id";
