from __future__ import annotations

from pathlib import Path
import sys


SNIPPET = """
<style>
#caret-nav {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 10000;
  display: flex;
  gap: 10px;
}
#caret-nav button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.72);
}
#caret-nav button:hover {
  background: rgba(15, 23, 42, 0.9);
}
</style>
<div id="caret-nav" aria-label="Slide navigation">
  <button id="caret-prev" aria-label="Previous slide">&lt;</button>
  <button id="caret-next" aria-label="Next slide">&gt;</button>
</div>
<script>
(() => {
  const prev = document.getElementById("caret-prev");
  const next = document.getElementById("caret-next");
  const goPrev = () => window.Reveal && window.Reveal.left();
  const goNext = () => window.Reveal && window.Reveal.right();
  prev && prev.addEventListener("click", goPrev);
  next && next.addEventListener("click", goNext);
})();
</script>
"""


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python inject_nav_carets.py <html_file>")
        return 2

    html = Path(sys.argv[1])
    if not html.exists():
        print(f"File not found: {html}")
        return 1

    text = html.read_text(encoding="utf-8")
    if "id=\"caret-nav\"" in text:
        print("Caret navigation already present; no changes made.")
        return 0

    if "</body>" not in text:
        print("No </body> tag found; cannot inject caret nav.")
        return 1

    text = text.replace("</body>", SNIPPET + "\n</body>")
    html.write_text(text, encoding="utf-8")
    print(f"Injected caret navigation into {html}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
