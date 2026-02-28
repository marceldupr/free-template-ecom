"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface SelectedStore {
  id: string;
  name: string;
  email?: string;
  address?: string;
  image_url?: string;
}

const LOCATION_KEY = "aurora-location";
const STORE_KEY = "aurora-selected-store";

function loadLocation(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCATION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveLocation(loc: UserLocation) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
}

function loadStore(): SelectedStore | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveStore(store: SelectedStore | null) {
  if (typeof window === "undefined") return;
  if (store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } else {
    localStorage.removeItem(STORE_KEY);
  }
}

interface StoreContextValue {
  location: UserLocation | null;
  setLocation: (loc: UserLocation) => void;
  store: SelectedStore | null;
  setStore: (store: SelectedStore | null) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<UserLocation | null>(null);
  const [store, setStoreState] = useState<SelectedStore | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocationState(loadLocation());
    setStoreState(loadStore());
    setMounted(true);
  }, []);

  const setLocation = useCallback((loc: UserLocation) => {
    setLocationState(loc);
    saveLocation(loc);
  }, []);

  const setStore = useCallback((s: SelectedStore | null) => {
    setStoreState(s);
    saveStore(s);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        location: mounted ? location : null,
        setLocation,
        store: mounted ? store : null,
        setStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
