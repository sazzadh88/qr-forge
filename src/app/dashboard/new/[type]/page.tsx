import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { getOrigin, requireUser } from "@/lib/auth";
import { listFolders, listTemplates } from "@/lib/db";
import { isType } from "@/lib/payload";

export default async function NewOfType({ params }: PageProps<"/dashboard/new/[type]">) {
  const { type } = await params;
  if (!isType(type)) notFound();
  const user = await requireUser();
  return <Editor type={type} origin={await getOrigin()} folders={listFolders(user.id)} templates={listTemplates(user.id)} />;
}
