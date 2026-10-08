import { supabase } from "@/integrations/supabase/client";

/** Envia o comprovante ao bucket privado `comprovantes` (pasta = id do usuário, como exige a policy). Devolve o caminho. */
export async function uploadComprovante(file: File, uid: string): Promise<string> {
  const safe = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "_").slice(-80);
  const path = `${uid}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from("comprovantes").upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw new Error(error.message);
  return path;
}
export async function openComprovante(path: string) {
  const { data, error } = await supabase.storage.from("comprovantes").createSignedUrl(path, 300);
  if (error || !data?.signedUrl) throw new Error(error?.message ?? "Não foi possível abrir o comprovante");
  window.open(data.signedUrl, "_blank", "noopener");
}
export const fileLabel = (path: string) => path.split("/").pop()!.replace(/^\d+-/, "");
