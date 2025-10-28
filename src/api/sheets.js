export async function fetchSheet(sheetId, sheetIndex = 0) {
  const sheetNames = ["Classifica", "Eventi"]; // 👈 assicurati che sia in questo ordine
  const sheetName = sheetNames[sheetIndex];
  const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Errore nel fetch del foglio");
  return await response.json();
}
