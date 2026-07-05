import { redirect } from "next/navigation";

// La ruta canónica del detalle de noticia es /noticia/[id].
// /noticia sin id lleva a la historia principal del briefing de hoy.
export default function NoticiaIndex() {
  redirect("/noticia/acuerdo-eeuu-china");
}
