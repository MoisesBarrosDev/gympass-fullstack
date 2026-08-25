"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  Metric,
  PageHead,
  Pagination,
  Section,
  Toast,
} from "@/components/ui/primitives";
import { useToast } from "@/hooks/use-toast";
import { api, getErrorMessage } from "@/lib/api-client";
import type { CheckIn } from "@/lib/domain";

export function AdminCheckInsIsland() {
  const [pending, setPending] = useState<CheckIn[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [validated, setValidated] = useState<CheckIn[]>([]);
  const [validatedPage, setValidatedPage] = useState(1);
  const [expired, setExpired] = useState<CheckIn[]>([]);
  const [expiredPage, setExpiredPage] = useState(1);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState<CheckIn | null>(null);
  const { toast, notify } = useToast();

  const loadPending = useCallback(
    async (page = 1) => {
      try {
        setPending(
          (
            await api<{ checkIns: CheckIn[] }>(
              `/check-ins/pending?page=${page}`,
            )
          ).checkIns,
        );
        setPendingPage(page);
      } catch (cause) {
        notify(getErrorMessage(cause), true);
      }
    },
    [notify],
  );
  const loadValidated = useCallback(
    async (page = 1) => {
      try {
        setValidated(
          (
            await api<{ checkIns: CheckIn[] }>(
              `/check-ins/validated?page=${page}`,
            )
          ).checkIns,
        );
        setValidatedPage(page);
      } catch (cause) {
        notify(getErrorMessage(cause), true);
      }
    },
    [notify],
  );
  const loadExpired = useCallback(
    async (page = 1) => {
      try {
        setExpired(
          (
            await api<{ checkIns: CheckIn[] }>(
              `/check-ins/expired?page=${page}`,
            )
          ).checkIns,
        );
        setExpiredPage(page);
      } catch (cause) {
        notify(getErrorMessage(cause), true);
      }
    },
    [notify],
  );
  const loadCount = useCallback(async () => {
    try {
      setCount(
        (await api<{ checkInsCount: number }>("/check-ins/metrics/global"))
          .checkInsCount,
      );
    } catch (cause) {
      notify(getErrorMessage(cause), true);
    }
  }, [notify]);

  useEffect(() => {
    loadPending();
    loadValidated();
    loadExpired();
    loadCount();
  }, [loadPending, loadValidated, loadExpired, loadCount]);

  async function validate(id: string) {
    try {
      await api(`/check-ins/${id}/validate`, { method: "PATCH" });
      notify("Check-in validado.");
      await Promise.all([
        loadPending(pendingPage),
        loadValidated(validatedPage),
        loadCount(),
      ]);
    } catch (cause) {
      notify(getErrorMessage(cause), true);
    }
  }

  async function deleteExpired(check: CheckIn) {
    try {
      await api(`/check-ins/expired/${check.id}`, { method: "DELETE" });
      notify("Check-in expirado removido do histórico.");
      await loadExpired(expiredPage);
    } catch (cause) {
      notify(getErrorMessage(cause), true);
      throw cause;
    }
  }

  return (
    <>
      <Toast toast={toast} />
      <PageHead
        eyebrow="GESTÃO DE CHECK-INS"
        title="Check-ins."
        text="Valide pendências e acompanhe os check-ins dos alunos."
      >
        <Metric count={count} />
      </PageHead>
      <CheckInPanel
        kind="pending"
        checks={pending}
        page={pendingPage}
        setPage={loadPending}
        validate={validate}
      />
      <CheckInPanel
        kind="validated"
        checks={validated}
        page={validatedPage}
        setPage={loadValidated}
      />
      <CheckInPanel
        kind="expired"
        checks={expired}
        page={expiredPage}
        setPage={loadExpired}
        remove={setDeleting}
      />
      {deleting && (
        <DeleteExpiredDialog
          check={deleting}
          close={() => setDeleting(null)}
          confirm={() => deleteExpired(deleting)}
        />
      )}
    </>
  );
}

type PanelKind = "pending" | "validated" | "expired";
function CheckInPanel({
  kind,
  checks,
  page,
  setPage,
  validate,
  remove,
}: {
  kind: PanelKind;
  checks: CheckIn[];
  page: number;
  setPage: (page: number) => void;
  validate?: (id: string) => void;
  remove?: (check: CheckIn) => void;
}) {
  const copy = {
    pending: {
      title: "Check-ins aguardando validação",
      meta: "pendente(s)",
      empty: "Nenhum check-in dentro do prazo de validação.",
      icon: "clock" as const,
    },
    validated: {
      title: "Check-ins validados",
      meta: "validado(s)",
      empty: "Nenhum check-in validado.",
      icon: "check" as const,
    },
    expired: {
      title: "Check-ins expirados",
      meta: "expirado(s)",
      empty: "Nenhum check-in expirado.",
      icon: "close" as const,
    },
  }[kind];
  return (
    <section className="panel pending-panel">
      <Section
        title={copy.title}
        meta={`${checks.length} ${copy.meta} nesta página`}
      />
      {checks.length === 0 ? (
        <div className="empty-row">{copy.empty}</div>
      ) : (
        <div className="pending-list">
          {checks.map((check) => (
            <div
              className={`pending-row ${kind === "validated" ? "validated-check-row" : kind === "expired" ? "expired-check-row" : ""}`}
              key={check.id}
            >
              <i>
                <Icon name={copy.icon} />
              </i>
              <div>
                <strong>{check.user?.name || "Usuário"}</strong>
                <span>{check.user?.email || check.user_id}</span>
              </div>
              <div>
                <strong>{check.gym?.title || "Academia"}</strong>
                <span>
                  {kind === "validated" ? "Validado em " : ""}
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(
                    new Date(
                      kind === "validated"
                        ? check.validated_at || check.created_at
                        : check.created_at,
                    ),
                  )}
                </span>
              </div>
              {kind === "pending" && (
                <button
                  className="primary"
                  onClick={() => validate?.(check.id)}
                >
                  Validar
                </button>
              )}
              {kind === "expired" && (
                <button
                  className="icon danger"
                  aria-label={`Excluir check-in expirado de ${check.user?.name || "usuário"}`}
                  title="Excluir do histórico"
                  onClick={() => remove?.(check)}
                >
                  <Icon name="trash" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} itemCount={checks.length} setPage={setPage} />
    </section>
  );
}

function DeleteExpiredDialog({
  check,
  close,
  confirm,
}: {
  check: CheckIn;
  close: () => void;
  confirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  async function proceed() {
    setLoading(true);
    try {
      await confirm();
      close();
    } finally {
      setLoading(false);
    }
  }
  return (
    <div
      className="backdrop"
      onMouseDown={(event) =>
        !loading && event.target === event.currentTarget && close()
      }
    >
      <div
        className="confirm-modal destructive"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-expired-check-in-title"
      >
        <div className="confirm-symbol">
          <Icon name="trash" size={28} />
        </div>
        <span className="eyebrow">REMOVER DO HISTÓRICO</span>
        <h2 id="delete-expired-check-in-title">Excluir check-in expirado?</h2>
        <p>
          O check-in de {check.user?.name || "este usuário"} na{" "}
          {check.gym?.title || "academia"} será removido definitivamente e
          deixará de aparecer na jornada do aluno.
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="secondary"
            onClick={close}
            disabled={loading}
            autoFocus
          >
            Cancelar
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={proceed}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir check-in"}
          </button>
        </div>
      </div>
    </div>
  );
}
