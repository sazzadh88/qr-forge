import { requireUser } from "@/lib/auth";
import { listTemplates } from "@/lib/db";
import TemplatesView from "./TemplatesView";

export default async function Templates() {
  const user = await requireUser();
  return <TemplatesView templates={listTemplates(user.id)} />;
}
