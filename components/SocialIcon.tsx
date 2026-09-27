import { SiInstagram, SiTiktok, SiYoutube, type IconType } from "@icons-pack/react-simple-icons";
import type { SOCIAL_LINKS } from "@/constants";

export type SocialNetwork = keyof typeof SOCIAL_LINKS;

export const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

// Official brand marks from Simple Icons, drawn in the surrounding text colour.
const ICONS: Record<SocialNetwork, IconType> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
};

export function SocialIcon({ network, size = 22 }: { network: SocialNetwork; size?: number }) {
  const Icon = ICONS[network];
  return <Icon size={size} color="currentColor" aria-hidden />;
}
