import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";

const MAX = 50;
const WEB_KEY = "plant_scan_history";

function historyFile() {
  return new File(Paths.document, "scan_history.json");
}


async function read(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(WEB_KEY);
  const f = historyFile();
  if (!f.exists) return null;
  return f.text();
}

function write(data: string): void {
  if (Platform.OS === "web") {
    localStorage.setItem(WEB_KEY, data);
    return;
  }
  try {
    const f = historyFile();
    if (!f.exists) f.create();
    f.write(data);
  } catch {}
}

export type ScanRecord = {
  id: string;
  imageUri: string;
  disease: string;
  confidence: number;
  scannedAt: number;
};

export async function initHistory(): Promise<void> {
  if (Platform.OS === "web") {
    if (!localStorage.getItem(WEB_KEY)) localStorage.setItem(WEB_KEY, "[]");
    return;
  }
  const f = historyFile();
  if (!f.exists) {
    f.create();
    f.write("[]");
  }
}

export async function getHistory(): Promise<ScanRecord[]> {
  const raw = await read();
  return raw ? JSON.parse(raw) : [];
}

export async function addScan(
  entry: Omit<ScanRecord, "id" | "scannedAt">,
): Promise<void> {
  const history = await getHistory();
  const id = Date.now().toString();
  const record: ScanRecord = { ...entry, id, scannedAt: Date.now() };
  write(JSON.stringify([record, ...history].slice(0, MAX)));
}

