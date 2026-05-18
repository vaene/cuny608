import type { ReactNode } from "react";

import SlideDeckShell, { type DeckSlide } from "./SlideDeckShell";

interface SlideTemplateProps {
  currentPath: string;
  slides: readonly DeckSlide[];
  deckLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  theme?: "light" | "dark";
}

export default function SlideTemplate(props: SlideTemplateProps) {
  return <SlideDeckShell {...props} />;
}
