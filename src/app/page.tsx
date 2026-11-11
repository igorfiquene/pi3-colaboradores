import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">
        Sistema de Cadastro de Colaboradores
      </h1>
      <p className="text-gray-700">
        Projeto Interdisciplinar III — UniCEUMA. Sistema de demonstração
        acadêmica com foco na importância dos testes de software.
      </p>
      <Link
        href="/colaboradores"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded w-fit hover:bg-blue-700"
      >
        Ir para colaboradores
      </Link>
    </div>
  );
}
