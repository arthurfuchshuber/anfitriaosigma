import { useEffect, useRef, useState } from "react";
import { openWhatsAppLead } from "@/lib/whatsapp";

type NominatimResult = { display_name: string; address?: Record<string, string> };
type Suggestion = { label: string; cidade: string; estado: string; cep: string };

const UF: Record<string, string> = {
  Acre: "AC", Alagoas: "AL", Amapá: "AP", Amazonas: "AM", Bahia: "BA", Ceará: "CE", "Distrito Federal": "DF", "Espírito Santo": "ES",
  Goiás: "GO", Maranhão: "MA", "Mato Grosso": "MT", "Mato Grosso do Sul": "MS", "Minas Gerais": "MG", Pará: "PA", Paraíba: "PB",
  Paraná: "PR", Pernambuco: "PE", Piauí: "PI", "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN", "Rio Grande do Sul": "RS",
  Rondônia: "RO", Roraima: "RR", "Santa Catarina": "SC", "São Paulo": "SP", Sergipe: "SE", Tocantins: "TO",
};

export function useLeadForm() {
  const [form, setForm] = useState({
    nome: "", endereco: "", cidade: "", estado: "", cep: "", complemento: "", ganhos: "",
    mobiliado: "sim" as "sim" | "nao", inicio: "Imediata",
  });
  const [sugg, setSugg] = useState<Suggestion[]>([]);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<number>();
  const picked = useRef(false);

  const set = (k: "nome" | "cidade" | "estado" | "cep" | "complemento" | "ganhos" | "inicio") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Autopreenchimento de endereço (OpenStreetMap/Nominatim, gratuito). Para volume alto,
  // trocar por Google Places mantendo a mesma interface (Suggestion).
  useEffect(() => {
    window.clearTimeout(timer.current);
    if (picked.current) { picked.current = false; return; }
    const q = form.endereco.trim();
    if (q.length < 5) { setSugg([]); return; }
    timer.current = window.setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=br&limit=5&accept-language=pt-BR&q=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();
        setSugg(
          (data as NominatimResult[]).map((d) => {
            const a = d.address || {};
            const cidade = a.city || a.town || a.village || a.municipality || "";
            const estado = UF[a.state] || a.state || "";
            return { label: d.display_name, cidade, estado, cep: a.postcode || "" };
          }),
        );
      } catch {
        setSugg([]);
      }
    }, 500);
    return () => window.clearTimeout(timer.current);
  }, [form.endereco]);

  const onAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, endereco: e.target.value }));
    setShow(true);
  };
  const pick = (s: Suggestion) => {
    picked.current = true;
    setForm((f) => ({ ...f, endereco: s.label.split(",").slice(0, 3).join(",").trim(), cidade: s.cidade, estado: s.estado, cep: s.cep }));
    setSugg([]);
    setShow(false);
  };
  const submit = () => {
    if (!form.nome.trim() || !form.endereco.trim()) {
      setError("Informe seu nome e o endereço do imóvel.");
      return;
    }
    setError("");
    openWhatsAppLead(form);
  };

  return { form, setForm, set, sugg, show, setShow, error, onAddress, pick, submit };
}
