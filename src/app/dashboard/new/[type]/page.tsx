import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { getOrigin, requireUser } from "@/lib/auth";
import { listFolders, listTemplates } from "@/lib/db";
import { isType } from "@/lib/payload";

export default async function NewOfType({ params, searchParams }: PageProps<"/dashboard/new/[type]">) {
  const { type } = await params;
  const tpl = Number((await searchParams).template);
  if (!isType(type)) notFound();
  const user = await requireUser();
  const templates = listTemplates(user.id);
  return (
    <Editor
      type={type}
      origin={await getOrigin()}
      folders={listFolders(user.id)}
      templates={templates}
      startDesign={templates.find((t) => t.id === tpl)?.design}
    />
  );
}
