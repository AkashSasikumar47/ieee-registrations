import { redirect } from "next/navigation";

export default async function JoinPage({
  params,
  searchParams,
}: PageProps<"/[slug]/join">) {
  const { slug } = await params;
  const code = (await searchParams).code;
  redirect(
    typeof code === "string"
      ? `/${slug}?code=${encodeURIComponent(code)}`
      : `/${slug}`,
  );
}
