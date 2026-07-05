import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#000", color: "#f5f5f7" }}
    >

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p
          className="text-[8rem] sm:text-[12rem] font-extralight tracking-tight leading-none select-none"
          style={{ color: "#2d2d2d" }}
        >
          404
        </p>

        <h1 className="text-2xl font-extralight tracking-wide mt-6">
          Pagina no encontrada
        </h1>

        <p className="mt-4 max-w-md text-base" style={{ color: "#86868b" }}>
          La pagina que buscas no existe o ha sido movida.
        </p>

        <Link
          href="/"
          className="mt-10 inline-block rounded-full bg-white text-black px-10 py-3.5 text-[11px] uppercase tracking-[0.25em] font-semibold transition-opacity hover:opacity-85"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
