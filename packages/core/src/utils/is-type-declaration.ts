const TYPE_DECLARATION_RE = /\.d\.[cm]?ts$/;

export function isTypeDeclaration(file: string) {
  return TYPE_DECLARATION_RE.test(file);
}
