"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  Empty,
  Metric,
  PageHead,
  Pagination,
  Toast,
} from "@/components/ui/primitives";
import { useToast } from "@/hooks/use-toast";
import { api, getErrorMessage } from "@/lib/api-client";
import type { Gym, User } from "@/lib/domain";
import { formatCoordinate } from "@/lib/format";

export function DiscoveryIsland({ user }: { user: User }) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState<"list" | "nearby">("list");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);
  const { toast, notify } = useToast();

  const loadGyms = useCallback(
    async (query = "", requestedPage = 1) => {
      const currentRequest = ++requestId.current;
      setLoading(true);
      try {
        const path = query.trim()
          ? `/gyms/search?query=${encodeURIComponent(query.trim())}&page=${requestedPage}`
          : `/gyms?page=${requestedPage}`;
        const data = await api<{ gyms: Gym[] }>(path);
        if (currentRequest === requestId.current) {
          setGyms(data.gyms);
          setPage(requestedPage);
          setSource("list");
        }
      } catch (cause) {
        if (currentRequest === requestId.current)
          notify(getErrorMessage(cause), true);
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    },
    [notify],
  );

  const loadCount = useCallback(async () => {
    try {
      const path =
        user.role === "ADMIN"
          ? "/check-ins/metrics/global"
          : "/check-ins/metrics";
      setCount((await api<{ checkInsCount: number }>(path)).checkInsCount);
    } catch (cause) {
      notify(getErrorMessage(cause), true);
    }
  }, [notify, user.role]);

  useEffect(() => {
    loadGyms();
    loadCount();
  }, [loadGyms, loadCount]);

  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    },
    [],
  );

  function scheduleSearch(query: string) {
    requestId.current++;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadGyms(query, 1), 350);
  }

  function searchNow() {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    loadGyms(search, 1);
  }

  function nearby(requestedPage = 1) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const currentRequest = ++requestId.current;
    setLoading(true);
    if (!navigator.geolocation) {
      setLoading(false);
      notify("Seu navegador não oferece suporte à localização.", true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await api<{ gyms: Gym[] }>(
            `/gyms/nearby?userLatitude=${coords.latitude}&userLongitude=${coords.longitude}&page=${requestedPage}`,
          );
          if (currentRequest !== requestId.current) return;
          setGyms(data.gyms);
          setPage(requestedPage);
          setSource("nearby");
          setSearch("");
          if (requestedPage === 1)
            notify(`${data.gyms.length} academia(s) encontrada(s) por perto.`);
        } catch (cause) {
          if (currentRequest === requestId.current)
            notify(getErrorMessage(cause), true);
        } finally {
          if (currentRequest === requestId.current) setLoading(false);
        }
      },
      () => {
        if (currentRequest !== requestId.current) return;
        setLoading(false);
        notify("Permita o acesso à sua localização.", true);
      },
    );
  }

  function changePage(nextPage: number) {
    if (source === "nearby") nearby(nextPage);
    else loadGyms(search, nextPage);
  }

  function checkIn(gym: Gym) {
    if (!navigator.geolocation) {
      notify("Seu navegador não oferece suporte à localização.", true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await api(`/gyms/${gym.id}/check-ins`, {
            method: "POST",
            body: JSON.stringify({
              userLatitude: coords.latitude,
              userLongitude: coords.longitude,
            }),
          });
          notify(`Check-in realizado na ${gym.title}!`);
          loadCount();
        } catch (cause) {
          notify(getErrorMessage(cause), true);
        }
      },
      () => notify("Precisamos da sua localização para o check-in.", true),
    );
  }

  return (
    <>
      <Toast toast={toast} />
      <PageHead
        eyebrow="EXPLORE SUA REGIÃO"
        title="Encontre seu próximo treino."
        text="Academias prontas para receber você."
      >
        <Metric count={count} />
      </PageHead>
      <div className="searchbar">
        <div>
          <Icon name="search" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              scheduleSearch(event.target.value);
            }}
            onKeyDown={(event) => event.key === "Enter" && searchNow()}
            placeholder="Busque uma academia"
          />
        </div>
        <button className="secondary" onClick={searchNow}>
          Buscar
        </button>
        <button className="location" onClick={() => nearby(1)}>
          <Icon name="locate" />
          Perto de mim
        </button>
      </div>
      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <GymGrid
            gyms={gyms}
            allowCheckIn={user.role === "MEMBER"}
            checkIn={checkIn}
          />
          <Pagination
            page={page}
            itemCount={gyms.length}
            setPage={changePage}
          />
        </>
      )}
    </>
  );
}

function GymGrid({
  gyms,
  allowCheckIn,
  checkIn,
}: {
  gyms: Gym[];
  allowCheckIn: boolean;
  checkIn: (gym: Gym) => void;
}) {
  if (!gyms.length)
    return (
      <Empty text="Tente outra busca ou procure academias perto de você." />
    );
  return (
    <div className="gym-grid">
      {gyms.map((gym, index) => (
        <article className="gym-card" key={gym.id}>
          <div className={`art art-${index % 4}`}>
            <span>
              <Icon name="pin" size={14} />
              Espaço ativo
            </span>
            <Icon name="building" size={52} />
          </div>
          <div className="card-body">
            <h2>{gym.title}</h2>
            <p>
              {gym.description || "Um espaço para cuidar do corpo e da mente."}
            </p>
            {gym.phone && (
              <a href={`tel:${gym.phone}`}>
                <Icon name="phone" />
                {gym.phone}
              </a>
            )}
            <footer>
              <span>
                <Icon name="pin" />
                {formatCoordinate(gym.latitude)},{" "}
                {formatCoordinate(gym.longitude)}
              </span>
              {allowCheckIn && (
                <button onClick={() => checkIn(gym)}>
                  Fazer check-in
                  <Icon name="arrow" />
                </button>
              )}
            </footer>
          </div>
        </article>
      ))}
    </div>
  );
}
