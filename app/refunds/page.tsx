import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";
import { LEGAL_PAGES } from "@/data/legal";

const page = LEGAL_PAGES.refunds;

export const metadata: Metadata = {
  title: `${page.title} — Anny Bakes Cakes and Treats`,
  description: page.summary,
};

export default function RefundsPage() {
  return <LegalDocument page={page} />;
}
