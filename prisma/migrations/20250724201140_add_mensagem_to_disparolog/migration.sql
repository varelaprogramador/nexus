/*
  Warnings:

  - Added the required column `mensagem` to the `DisparoLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DisparoLog" ADD COLUMN     "mensagem" TEXT NOT NULL;
