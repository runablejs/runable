// vite-plugins/sfc-inject.ts
import MagicString, { SourceMap } from "magic-string";
import { relative, dirname } from "path";
import { ComponentInfo } from "./types";

export interface ScannedComponent {
  name: string; // ex: "BaseButton"
  file: string; // chemin absolu vers le .vue
}

// Normalise "BaseButton", "base-button", "Base_Button" -> "basebutton"
// pour comparer les noms indépendamment de la casse/format
export function normalizeName(name: string): string {
  return name.replace(/[-_]/g, "").toLowerCase();
}

// Regex qui capture les appels _resolveComponent("Nom") ou resolveComponent("Nom")
// générés par le compilateur SFC de Vue pour les composants non enregistrés
const RESOLVE_COMPONENT_RE =
  /(?:_|)resolveComponent\(\s*["']([^"']+)["']\s*\)/g;

export interface TransformResult {
  code: string;
  map: SourceMap;
}

export function injectComponents(
  code: string,
  id: string,
  componentMap: Map<string, ComponentInfo>,
): TransformResult | null {
  // Rien à faire si aucun appel resolveComponent n'est présent
  if (!code.includes("resolveComponent")) return null;

  const s = new MagicString(code);
  const usedImports = new Map<string, string>(); // file -> nom de variable importée
  let importCounter = 0;
  let hasChanges = false;

  let match: RegExpExecArray | null;
  RESOLVE_COMPONENT_RE.lastIndex = 0;

  while ((match = RESOLVE_COMPONENT_RE.exec(code))) {
    const [fullMatch, rawName] = match;
    if (!rawName) continue;

    const component = componentMap.get(normalizeName(rawName));

    if (!component) continue; // pas un de nos composants auto-importés, on laisse tel quel

    // Réutilise l'import s'il existe déjà pour ce fichier
    let varName = usedImports.get(component.path);
    if (!varName) {
      varName = `__auto_component_${importCounter++}`;
      usedImports.set(component.path, varName);
    }

    // Récupère la déclaration englobante : on doit remplacer
    // `const _component_base_button = _resolveComponent("BaseButton")`
    // par                                  `const _component_base_button = __auto_component_0`
    const start = match.index;
    const end = start + fullMatch.length;

    s.overwrite(start, end, varName);
    hasChanges = true;
  }

  if (!hasChanges) return null;

  // Génère les imports en tête de fichier avec chemins relatifs
  const importLines = [...usedImports.entries()]
    .map(([file, varName]) => {
      let rel = relative(dirname(id), file).replace(/\\/g, "/");
      if (!rel.startsWith(".")) rel = `./${rel}`;
      return `import ${varName} from ${JSON.stringify(rel)};`;
    })
    .join("\n");

  s.prepend(`${importLines}\n`);

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true, source: id }),
  };
}
