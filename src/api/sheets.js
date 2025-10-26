// Fetch Google Sheet public (view-only) via gviz endpoint
export async function fetchSheet(sheetId, gid = 0) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${gid}`;
  const res = await fetch(url);
  const text = await res.text();
  const jsonText = text.replace(/^[^\(]*\(\s*/, '').replace(/\);\s*$/, '');
  const data = JSON.parse(jsonText);
  const rows = data.table.rows || [];
  const cols = data.table.cols.map(c => c.label || c.id);
  return rows.map(r => {
    const obj = {};
    (r.c||[]).forEach((cell,i)=>obj[cols[i]||`col${i}`]=cell?cell.v:"");
    return obj;
  });
}
