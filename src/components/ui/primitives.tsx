import type { ReactNode } from "react";
import { Icon } from "./icon";

export function Logo() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Icon name="logo" size={27} />
      </span>
      <b>
        gym<span>pass</span>
      </b>
    </div>
  );
}

export function PageHead({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {children}
    </div>
  );
}

export function Section({
  title,
  meta,
  action,
}: {
  title: string;
  meta: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <div className="section-actions">
        <span>{meta}</span>
        {action}
      </div>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <span>
        <Icon name="building" size={30} />
      </span>
      <h3>Nada por aqui ainda</h3>
      <p>{text}</p>
    </div>
  );
}

export function Pagination({
  page,
  itemCount,
  setPage,
}: {
  page: number;
  itemCount: number;
  setPage: (page: number) => void;
}) {
  const hasNext = itemCount === 20;
  if (page === 1 && !hasNext) return null;
  return (
    <nav className="pagination" aria-label="Paginação">
      <button
        className="secondary"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        <Icon name="arrow" />
        Anterior
      </button>
      <span>
        Página <strong>{page}</strong>
      </span>
      <button
        className="secondary"
        disabled={!hasNext}
        onClick={() => setPage(page + 1)}
      >
        Próxima
        <Icon name="arrow" />
      </button>
    </nav>
  );
}

export function Toast({
  toast,
}: {
  toast: { text: string; bad?: boolean } | null;
}) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.bad ? "bad" : ""}`}>
      <Icon name={toast.bad ? "close" : "check"} />
      {toast.text}
    </div>
  );
}

export function Metric({ count }: { count: number }) {
  return (
    <div className="metric">
      <Icon name="check" />
      <strong>
        {count}
        <small>check-ins validados</small>
      </strong>
    </div>
  );
}
