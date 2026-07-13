import { notFound } from "next/navigation";
import { getAllSlugs, getSectionBySlug } from "@/brand-kit/config/sections.config";
import { ContentLayout } from "@/brand-kit/content/ContentLayout";
import { SectionContent } from "@/brand-kit/content/SectionContent";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const section = getSectionBySlug(slug);

  if (!section) return {};

  return {
    title: `${section.title} — Counterparty Brand Guidelines`,
  };
}

export default async function SectionPage({ params }: PageProps) {
  const { slug } = await params;
  const section = getSectionBySlug(slug);

  if (!section) {
    notFound();
  }

  return (
    <ContentLayout slug={slug}>
      <SectionContent slug={slug} />
    </ContentLayout>
  );
}
