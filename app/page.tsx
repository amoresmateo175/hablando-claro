
import { Suspense } from "react";
import HomeClient from "./HomeClient";

export const instant = false;

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] items-center justify-center bg-gray-50">
          <p className="text-gray-500">Cargando página...</p>
        </main>
      }
    >
      <HomeClient />
    </Suspense>
  );
}
