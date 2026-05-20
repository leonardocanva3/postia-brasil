CREATE TYPE "DesignerLevel" AS ENUM (
    'JUNIOR',
    'PLENO',
    'SENIOR',
    'PREMIUM'
);

ALTER TABLE "generated_arts" ADD COLUMN "designerLevel" "DesignerLevel" NOT NULL DEFAULT 'SENIOR';
