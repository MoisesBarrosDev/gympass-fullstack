"use client";

import type { ReactNode } from "react";
import { Icon } from "./icon";

export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  return (
    <div
      className="backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">GESTÃO DE ACADEMIAS</span>
            <h2>{title}</h2>
          </div>
          <button className="icon" onClick={close} aria-label="Fechar">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
