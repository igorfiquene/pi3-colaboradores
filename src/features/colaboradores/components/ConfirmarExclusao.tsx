"use client";

import { useEffect, useRef } from "react";

type Props = {
  aberto: boolean;
  nome: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  emProgresso?: boolean;
};

export function ConfirmarExclusao({
  aberto,
  nome,
  onConfirmar,
  onCancelar,
  emProgresso,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirmar-titulo"
      className="rounded shadow-lg p-6 max-w-sm backdrop:bg-black/40"
      onCancel={(e) => {
        e.preventDefault();
        onCancelar();
      }}
    >
      <h2 id="confirmar-titulo" className="text-lg font-semibold mb-2">
        Excluir colaborador
      </h2>
      <p className="text-sm text-gray-700 mb-4">
        Tem certeza que deseja excluir <strong>{nome}</strong>? Esta ação pode
        ser revertida pelo administrador (exclusão lógica).
      </p>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancelar}
          className="px-3 py-1.5 border rounded hover:bg-gray-50"
          disabled={emProgresso}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          disabled={emProgresso}
        >
          {emProgresso ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </dialog>
  );
}
