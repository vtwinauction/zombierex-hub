/**
 * GPX exporter — build a GPX 1.1 track document from a recorded path.
 */
type P = { lat: number; lng: number; t?: number; alt?: number; spd?: number };

export function ridePathToGpx(name: string, path: P[], startedAt?: string): string {
  const esc = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;", "'":"&apos;" }[c]!));
  const pts = path.map((p) => {
    const time = p.t ? `<time>${new Date(p.t).toISOString()}</time>` : "";
    const ele = typeof p.alt === "number" ? `<ele>${p.alt.toFixed(1)}</ele>` : "";
    return `      <trkpt lat="${p.lat}" lon="${p.lng}">${ele}${time}</trkpt>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="ZOMBIEREX" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${esc(name)}</name>
    ${startedAt ? `<time>${startedAt}</time>` : ""}
  </metadata>
  <trk>
    <name>${esc(name)}</name>
    <trkseg>
${pts}
    </trkseg>
  </trk>
</gpx>`;
}

export function downloadGpx(filename: string, gpx: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".gpx") ? filename : `${filename}.gpx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
