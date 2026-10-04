import type { CSSProperties } from "react";

/**
 * Converte uma string de CSS inline ("a:b;c:d") em um objeto de estilo do React.
 * Mantém o layout validado no mockup 1:1 (mesmos valores, gradientes e animações),
 * sem precisar reescrever cada propriedade como classe Tailwind.
 */
const cache = new Map<string, CSSProperties>();

function splitDeclarations(input: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = "";
  for (const ch of input) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === "(") {
      depth++;
      cur += ch;
    } else if (ch === ")") {
      depth--;
      cur += ch;
    } else if (ch === ";" && depth === 0) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) out.push(cur);
  return out;
}

function toKey(prop: string): string {
  if (prop.startsWith("--")) return prop;
  if (prop.startsWith("-ms-")) return "ms" + camel(prop.slice(4));
  if (prop.startsWith("-")) return camel(prop.slice(1)).replace(/^./, (c) => c.toUpperCase());
  return camel(prop);
}

const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

export function css(input: string): CSSProperties {
  const hit = cache.get(input);
  if (hit) return hit;
  const style: Record<string, string> = {};
  for (const decl of splitDeclarations(input)) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop || !value) continue;
    style[toKey(prop)] = value;
  }
  cache.set(input, style as CSSProperties);
  return style as CSSProperties;
}
