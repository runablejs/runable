export function wrapText(text: string, width: number): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/);
    let line = "";

    for (const word of words) {
      if (line && line.length + word.length + 1 > width) {
        lines.push(line);
        line = word;
      } else {
        line += (line ? " " : "") + word;
      }
    }

    if (line) {
      lines.push(line);
    }
  }

  return lines;
}
