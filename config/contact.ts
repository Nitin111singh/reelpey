/**
 * Public contact / social links.
 *
 * Plain constants (no env, no zod) so this file is safe to import from client
 * components — unlike `@/config/config`, which pulls in dotenv and is server-only.
 *
 * TODO(nitin): replace the Instagram handle and Discord invite with the real ones.
 */

export const CONTACT_EMAIL = "reelpey7@gmail.com";

export const CONTACT_LINKS = {
  instagram: "https://www.instagram.com/reelpey/",
  discord: "https://discord.gg/tRS2CcRZaH",
} as const;

export type ContactPlatform = keyof typeof CONTACT_LINKS;
