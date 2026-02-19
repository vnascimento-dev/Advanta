export type DatajudSearchHit = {
  _source?: any;
};

function normalizeCNJ(input: string) {
  return String(input || "").replace(/\D+/g, "");
}

export async function datajudSearchByNumeroProcesso({
  apiKey,
  alias,
  numeroProcesso,
}: {
  apiKey: string;
  alias: string;
  numeroProcesso: string;
}) {
  const cnj = normalizeCNJ(numeroProcesso);
  if (!cnj) throw new Error("Número do processo (CNJ) inválido");

  const url = `https://api-publica.datajud.cnj.jus.br/${alias}/_search`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `APIKey ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        match: {
          numeroProcesso: cnj,
        },
      },
      size: 1,
      sort: [{ "@timestamp": { order: "desc" } }],
    }),
    // sempre server-side
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Datajud ${res.status}: ${text}`);
  }

  return res.json();
}
