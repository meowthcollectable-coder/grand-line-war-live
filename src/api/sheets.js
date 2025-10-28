// ✅ Lettura Google Sheet pubblici via opensheet.elk.sh
// Funziona anche da Vercel o da qualsiasi host
export async function fetchSheet(sheetId, sheetIndex = 0) {
  // 👇 Inserisci qui il nome reale delle schede nel tuo documento
  const sheetNames = ["Classifica", "Eventi"];
  const sheetName = sheetNames[sheetIndex];

  const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Errore fetchSheet: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
