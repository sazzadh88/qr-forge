import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { getOrigin, requireUser } from "@/lib/auth";
import { getQr, listFolders, listTemplates } from "@/lib/db";

export default async function EditQr({ params }: PageProps<"/dashboard/qr/[id]">) {
  const user = await requireUser();
  const qr = getQr(user.id, Number((await params).id));
  if (!qr) notFound();
  return (
    <Editor
      type={qr.type}
      origin={await getOrigin()}
      initial={{ id: qr.id, name: qr.name, slug: qr.slug, folderId: qr.folder_id, content: qr.content, design: qr.design, hasPassword: Boolean(qr.password) }}
      folders={listFolders(user.id)}
      templates={listTemplates(user.id)}
    />
  );
}
