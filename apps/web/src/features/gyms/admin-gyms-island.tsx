"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import {
  PageHead,
  Pagination,
  Section,
  Toast,
} from "@/components/ui/primitives";
import { useToast } from "@/hooks/use-toast";
import { api, getErrorMessage } from "@/lib/api-client";
import type { Gym } from "@/lib/domain";
import {
  formatCoordinate,
  formatPhone,
  GYM_PHONE_REGEX,
  normalizeCoordinate,
  parseCoordinate,
} from "@/lib/format";

type GymAction = "deactivate" | "restore" | "permanent";

export function AdminGymsIsland() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [totalGyms, setTotalGyms] = useState(0);
  const [page, setPage] = useState(1);
  const [deleted, setDeleted] = useState<Gym[]>([]);
  const [totalDeleted, setTotalDeleted] = useState(0);
  const [deletedPage, setDeletedPage] = useState(1);
  const [editing, setEditing] = useState<Gym | "new" | null>(null);
  const [confirmation, setConfirmation] = useState<{
    gym: Gym;
    action: GymAction;
  } | null>(null);
  const [deleteAll, setDeleteAll] = useState(false);
  const { toast, notify } = useToast();

  const loadGyms = useCallback(
    async (requestedPage = 1) => {
      try {
        const result = await api<{ gyms: Gym[]; total: number }>(
          `/gyms?page=${requestedPage}`,
        );
        setGyms(result.gyms);
        setTotalGyms(result.total);
        setPage(requestedPage);
      } catch (cause) {
        notify(getErrorMessage(cause), true);
      }
    },
    [notify],
  );
  const loadDeleted = useCallback(
    async (requestedPage = 1) => {
      try {
        const result = await api<{ gyms: Gym[]; total: number }>(
          `/gyms/deleted?page=${requestedPage}`,
        );
        setDeleted(result.gyms);
        setTotalDeleted(result.total);
        setDeletedPage(requestedPage);
      } catch (cause) {
        notify(getErrorMessage(cause), true);
      }
    },
    [notify],
  );
  useEffect(() => {
    loadGyms();
    loadDeleted();
  }, [loadGyms, loadDeleted]);

  async function runAction(gym: Gym, action: GymAction) {
    try {
      if (action === "deactivate")
        await api(`/gyms/${gym.id}`, { method: "DELETE" });
      if (action === "restore")
        await api(`/gyms/${gym.id}/restore`, { method: "PATCH" });
      if (action === "permanent")
        await api(`/gyms/${gym.id}/permanent`, { method: "DELETE" });
      notify(
        action === "deactivate"
          ? "Academia desativada."
          : action === "restore"
            ? "Academia recuperada."
            : "Academia excluída permanentemente.",
      );
      await Promise.all([loadGyms(page), loadDeleted(deletedPage)]);
    } catch (cause) {
      notify(getErrorMessage(cause), true);
      throw cause;
    }
  }

  async function permanentlyDeleteAll() {
    try {
      const result = await api<{ count: number }>("/gyms/deleted/permanent", {
        method: "DELETE",
      });
      notify(`${result.count} academia(s) excluída(s) permanentemente.`);
      await loadDeleted(1);
    } catch (cause) {
      notify(getErrorMessage(cause), true);
      throw cause;
    }
  }

  function saved() {
    notify(editing === "new" ? "Academia criada." : "Academia atualizada.");
    loadGyms(page);
  }

  return (
    <>
      <Toast toast={toast} />
      <PageHead
        eyebrow="PAINEL DE GESTÃO"
        title="Academias."
        text="Cadastre e mantenha os espaços da rede."
      >
        <button className="primary" onClick={() => setEditing("new")}>
          <Icon name="plus" />
          Nova academia
        </button>
      </PageHead>
      <GymTable
        title="Unidades ativas"
        gyms={gyms}
        total={totalGyms}
        page={page}
        setPage={loadGyms}
        empty="Nenhuma academia ativa."
        edit={setEditing}
        action={(gym) => setConfirmation({ gym, action: "deactivate" })}
      />
      <section className="panel deleted-panel">
        <Section
          title="Unidades excluídas"
          meta={`${deleted.length} nesta página · ${totalDeleted} no total`}
          action={
            deleted.length > 0 ? (
              <button
                className="delete-all-button"
                onClick={() => setDeleteAll(true)}
              >
                <Icon name="trash" size={16} />
                Excluir tudo
              </button>
            ) : undefined
          }
        />
        {deleted.length === 0 ? (
          <div className="empty-row">Nenhuma academia excluída.</div>
        ) : (
          <div className="gym-table">
            {deleted.map((gym) => (
              <div className="gym-row deleted-row" key={gym.id}>
                <i>
                  <Icon name="building" />
                </i>
                <div>
                  <strong>{gym.title}</strong>
                  <span>
                    Excluída{" "}
                    {gym.deleted_at
                      ? new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(gym.deleted_at))
                      : ""}
                  </span>
                </div>
                <small>
                  {formatCoordinate(gym.latitude)},{" "}
                  {formatCoordinate(gym.longitude)}
                </small>
                <button
                  className="icon restore-action"
                  aria-label={`Recuperar ${gym.title}`}
                  title="Recuperar academia"
                  onClick={() => setConfirmation({ gym, action: "restore" })}
                >
                  <Icon name="restore" />
                </button>
                <button
                  className="icon danger"
                  aria-label={`Excluir ${gym.title} permanentemente`}
                  title="Excluir permanentemente"
                  onClick={() => setConfirmation({ gym, action: "permanent" })}
                >
                  <Icon name="trash" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Pagination
          page={deletedPage}
          itemCount={deleted.length}
          setPage={loadDeleted}
        />
      </section>
      {editing && (
        <GymForm
          gym={editing === "new" ? undefined : editing}
          close={() => setEditing(null)}
          saved={saved}
        />
      )}{" "}
      {confirmation && (
        <ConfirmGymAction
          gym={confirmation.gym}
          action={confirmation.action}
          close={() => setConfirmation(null)}
          confirm={() => runAction(confirmation.gym, confirmation.action)}
        />
      )}{" "}
      {deleteAll && (
        <ConfirmDeleteAll
          count={deleted.length}
          close={() => setDeleteAll(false)}
          confirm={permanentlyDeleteAll}
        />
      )}
    </>
  );
}

function GymTable({
  title,
  gyms,
  total,
  page,
  setPage,
  empty,
  edit,
  action,
}: {
  title: string;
  gyms: Gym[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  empty: string;
  edit: (gym: Gym) => void;
  action: (gym: Gym) => void;
}) {
  return (
    <section className="panel">
      <Section
        title={title}
        meta={`${gyms.length} nesta página · ${total} no total`}
      />
      {gyms.length === 0 ? (
        <div className="empty-row">{empty}</div>
      ) : (
        <div className="gym-table">
          {gyms.map((gym) => (
            <div className="gym-row" key={gym.id}>
              <i>
                <Icon name="building" />
              </i>
              <div>
                <strong>{gym.title}</strong>
                <span>{gym.description || "Sem descrição"}</span>
              </div>
              <small>
                {formatCoordinate(gym.latitude)},{" "}
                {formatCoordinate(gym.longitude)}
              </small>
              <button
                className="icon"
                aria-label={`Editar ${gym.title}`}
                title="Editar academia"
                onClick={() => edit(gym)}
              >
                <Icon name="edit" />
              </button>
              <button
                className="icon danger"
                aria-label={`Excluir ${gym.title}`}
                title="Excluir academia"
                onClick={() => action(gym)}
              >
                <Icon name="trash" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} itemCount={gyms.length} setPage={setPage} />
    </section>
  );
}

function GymForm({
  gym,
  close,
  saved,
}: {
  gym?: Gym;
  close: () => void;
  saved: () => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [phone, setPhone] = useState(formatPhone(gym?.phone ?? ""));
  const [latitude, setLatitude] = useState(gym ? String(gym.latitude) : "");
  const [longitude, setLongitude] = useState(gym ? String(gym.longitude) : "");
  const [coordinateSource, setCoordinateSource] = useState<
    "manual" | "location" | null
  >(null);
  const locationRequestId = useRef(0);

  function useCurrentLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Seu navegador não oferece suporte à localização.");
      return;
    }
    const requestId = ++locationRequestId.current;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (locationRequestId.current !== requestId) return;
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setCoordinateSource("location");
        setLocating(false);
      },
      () => {
        if (locationRequestId.current !== requestId) return;
        setError(
          "Não foi possível obter sua localização. Verifique a permissão do navegador.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function setManualCoordinate(kind: "latitude" | "longitude", value: string) {
    locationRequestId.current++;
    setLocating(false);
    setCoordinateSource("manual");
    if (kind === "latitude") setLatitude(normalizeCoordinate(value));
    else setLongitude(normalizeCoordinate(value));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    locationRequestId.current++;
    setLocating(false);
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const lat = parseCoordinate(latitude);
    const lon = parseCoordinate(longitude);
    if (title.length < 3 || !/\p{L}/u.test(title))
      return setError(
        "O nome precisa ter pelo menos 3 caracteres e conter uma letra.",
      );
    if (description.length < 10)
      return setError("A descrição precisa ter pelo menos 10 caracteres.");
    if (!GYM_PHONE_REGEX.test(phone))
      return setError(
        "Informe um celular válido com DDD, por exemplo: (99) 99999-9999.",
      );
    if (!latitude.trim() || !Number.isFinite(lat) || lat < -90 || lat > 90)
      return setError("Informe uma latitude válida entre -90 e 90.");
    if (!longitude.trim() || !Number.isFinite(lon) || lon < -180 || lon > 180)
      return setError("Informe uma longitude válida entre -180 e 180.");
    setLoading(true);
    try {
      await api(gym ? `/gyms/${gym.id}` : "/gyms", {
        method: gym ? "PATCH" : "POST",
        body: JSON.stringify({
          title,
          description,
          phone,
          latitude: lat,
          longitude: lon,
        }),
      });
      saved();
      close();
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={gym ? "Editar academia" : "Nova academia"} close={close}>
      <form onSubmit={submit} noValidate autoComplete="off">
        <label>
          Nome
          <input
            name="title"
            minLength={3}
            maxLength={100}
            required
            defaultValue={gym?.title}
            placeholder="Ex.: Academia Movimento"
          />
        </label>
        <label>
          Descrição
          <textarea
            name="description"
            rows={3}
            minLength={10}
            maxLength={500}
            required
            defaultValue={gym?.description ?? ""}
            placeholder="Descreva o espaço em pelo menos 10 caracteres"
          />
        </label>
        <div className="form-row">
          <label>
            Celular com DDD
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              required
              maxLength={15}
              value={phone}
              onChange={(event) => setPhone(formatPhone(event.target.value))}
              placeholder="(99) 99999-9999"
            />
          </label>
          <span />
        </div>
        <div className="form-row">
          <label>
            Latitude
            <input
              name="latitude"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              required
              value={latitude}
              onChange={(event) =>
                setManualCoordinate("latitude", event.target.value)
              }
              placeholder="-22.875000"
            />
          </label>
          <label>
            Longitude
            <input
              name="longitude"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              required
              value={longitude}
              onChange={(event) =>
                setManualCoordinate("longitude", event.target.value)
              }
              placeholder="-43.242500"
            />
          </label>
        </div>
        <div className="coordinate-help">
          <span>
            {coordinateSource === "manual"
              ? "Coordenadas digitadas manualmente."
              : coordinateSource === "location"
                ? "Coordenadas preenchidas pela sua localização atual."
                : "Latitude: -90 a 90. Longitude: -180 a 180."}
          </span>
          <button
            type="button"
            className="secondary"
            onClick={useCurrentLocation}
            disabled={locating}
          >
            <Icon name="locate" />
            {locating ? "Localizando..." : "Usar localização atual"}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={close}>
            Cancelar
          </button>
          <button className="primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar academia"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmGymAction({
  gym,
  action,
  close,
  confirm,
}: {
  gym: Gym;
  action: GymAction;
  close: () => void;
  confirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const content = {
    deactivate: {
      eyebrow: "DESATIVAR UNIDADE",
      title: "Desativar academia?",
      text: `A academia “${gym.title}” deixará de aparecer nas buscas, mas poderá ser recuperada depois.`,
      button: "Desativar academia",
      icon: "trash" as const,
      danger: false,
    },
    restore: {
      eyebrow: "RECUPERAR UNIDADE",
      title: "Recuperar academia?",
      text: `A academia “${gym.title}” voltará a aparecer nas buscas e ficará disponível para check-ins.`,
      button: "Recuperar academia",
      icon: "restore" as const,
      danger: false,
    },
    permanent: {
      eyebrow: "AÇÃO IRREVERSÍVEL",
      title: "Excluir permanentemente?",
      text: `A academia “${gym.title}” e todos os check-ins relacionados serão apagados do banco. Esta ação não pode ser desfeita.`,
      button: "Excluir permanentemente",
      icon: "trash" as const,
      danger: true,
    },
  }[action];
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
        className={`confirm-modal ${content.danger ? "destructive" : ""}`}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="confirm-symbol">
          <Icon name={content.icon} size={28} />
        </div>
        <span className="eyebrow">{content.eyebrow}</span>
        <h2>{content.title}</h2>
        <p>{content.text}</p>
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
            className={content.danger ? "danger-button" : "primary"}
            onClick={proceed}
            disabled={loading}
          >
            {loading ? "Aguarde..." : content.button}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteAll({
  count,
  close,
  confirm,
}: {
  count: number;
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
      >
        <div className="confirm-symbol">
          <Icon name="trash" size={28} />
        </div>
        <span className="eyebrow">AÇÃO IRREVERSÍVEL</span>
        <h2>Excluir todas?</h2>
        <p>
          As {count} academias excluídas e todos os check-ins relacionados serão
          apagados definitivamente do banco. Esta ação não pode ser desfeita.
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
            {loading ? "Excluindo..." : "Excluir tudo"}
          </button>
        </div>
      </div>
    </div>
  );
}
