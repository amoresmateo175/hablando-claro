
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (     
    <footer className="relative z-[60] mt-auto border-t border-gray-200 bg-white pb-24 pt-8 md:pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Brand and copyright */}
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            aria-label="Hablando Claro - Inicio"
            className="inline-flex items-center justify-center"
          >
            <Image
              src="/images/logo-hablando-claro.png"
              alt="Hablando Claro"
              width={320}
              height={100}
              className="h-30 w-auto max-w-full object-contain"
            />
          </Link>

          <p className="mt-3 text-sm text-gray-600">
            Un espacio para compartir ideas y opiniones.
          </p>

          <div className="mt-4 text-sm leading-6 text-gray-500">
            <p>
              © {currentYear} Hablando Claro.
            </p>
            <p>
              Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Opinion disclaimer */}
        <div className="mt-7 border-t border-gray-100 pt-5">
          <p className="text-justify text-xs leading-6 text-gray-500 sm:text-sm">
            Según el Art. 60 de la Ley Orgánica de Comunicación, este
            contenido se identifica y clasifica como: (O), de opinión.
            Las opiniones vertidas en este artículo son de exclusiva
            responsabilidad de su autor y no reflejan necesariamente la
            línea editorial ni comprometen la responsabilidad del medio.
          </p>
        </div>
      </div>
    </footer>
  );
}
