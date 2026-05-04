const API_URL = "http://10.153.189.28:8000";

export type ScanRecord = {
  id: string;
  imageUri: string;
  disease: string;
  confidence: number;
  scannedAt: number;
};

export async function getHistory(): Promise<ScanRecord[]> {
  try {
    const res = await fetch(`${API_URL}/history`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function addScan(
  entry: Omit<ScanRecord, "id" | "scannedAt">,
): Promise<void> {
  try {
    await fetch(`${API_URL}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  } catch (e) {
    console.error("Failed to save scan history:", e);
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await fetch(`${API_URL}/history`, { method: "DELETE" });
  } catch (e) {
    console.error("Failed to clear history:", e);
  }
}
