import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";
import ProjectClient from "./project-client";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.title} — Keino Chichester`;
  const description = project.shortDescription;
  const url = `/work/${project.slug}`;
  const ogImage = project.heroImage ?? "/opengraph-image";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return <ProjectClient slug={slug} />;
}
