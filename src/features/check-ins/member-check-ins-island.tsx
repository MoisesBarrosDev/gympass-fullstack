"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  Empty,
  PageHead,
  Pagination,
  Section,
  Toast,
} from "@/components/ui/primitives";
import { useToast } from "@/hooks/use-toast";
import { api, getErrorMessage } from "@/lib/api-client";
import type { CheckIn } from "@/lib/domain";

export function MemberCheckInsIsland() {
  const [checks, setChecks] = useState<CheckIn[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const { toast, notify } = useToast();

  const load = useCallback(
    async (requestedPage = 1) => {
      try {
        const [history, metrics] = await Promise.all([
          api<{ checkIns: CheckIn[] }>(
            `/check-ins/history?page=${requestedPage}`,
          ),
          api<{ checkInsCount: number }>("/check-ins/metrics"),
        ]);
        setChecks(history.checkIns);
        setCount(metrics.checkInsCount);
        setPage(requestedPage);
      } catch (cause) {
        notify(getErrorMessage(cause), true);
      }
    },
    [notify],
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Toast toast={toast} />
      <PageHead
        eyebrow="CONSISTÊNCIA É TUDO"
        title="Minha jornada."
        text="Cada check-in conta uma parte da sua história."
      />
      <div className="journey">
        <div>
          <Icon name="check" size={26} />
          <strong>
            {count}
            <small>Check-ins validados</small>
          </strong>
        </div>
        <blockquote>“O progresso acontece quando você aparece.”</blockquote>
      </div>
      <section className="panel">
        <Section
          title="Atividade recente"
          meta={`${checks.length} registros nesta página`}
        />
        {checks.length === 0 ? (
          <Empty text="Seu primeiro treino começa agora." />
        ) : (
          <div className="timeline">
            {checks.map((check) => (
              <HistoryRow key={check.id} checkIn={check} />
            ))}
          </div>
        )}
        <Pagination page={page} itemCount={checks.length} setPage={load} />
      </section>
    </>
  );
}

function HistoryRow({ checkIn }: { checkIn: CheckIn }) {
  const expired = checkIn.status === "EXPIRED";
  const validated =
    checkIn.status === "VALIDATED" || Boolean(checkIn.validated_at);
  const status = validated ? "Validado" : expired ? "Expirado" : "Aguardando";
  const state = validated ? "valid" : expired ? "expired" : "";
  return (
    <div className="timeline-row">
      <i className={state}>
        <Icon name={validated ? "check" : expired ? "close" : "clock"} />
      </i>
      <div>
        <strong>{checkIn.gym?.title || "Academia"}</strong>
        <span>
          {new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "long",
            timeStyle: "short",
          }).format(new Date(checkIn.created_at))}
        </span>
      </div>
      <b className={state}>{status}</b>
    </div>
  );
}
