from __future__ import annotations

from pathlib import Path
import xml.etree.ElementTree as ET

from manim import *


config.background_color = "#F8FAFC"


class Story2Slideshow(Scene):
    """Manim slideshow driven by chart exports from Story2_updated.rmd."""

    def plot_asset(
        self,
        *names: str,
        width: float | None = None,
        height: float | None = None,
        line_only: bool = False,
        prefer_png: bool = False,
    ) -> Mobject:
        candidates: list[Path] = []
        search_roots = [Path("."), Path("plots_svg")]

        for name in names:
            n = Path(name)
            if n.suffix:
                for root in search_roots:
                    candidates.append(root / n.name)
            else:
                ext_order = (".png", ".svg") if prefer_png else (".svg", ".png")
                for ext in ext_order:
                    for root in search_roots:
                        candidates.append(root / f"{name}{ext}")

        p = next((c for c in candidates if c.exists()), None)
        if p is None:
            tried = ", ".join(str(c) for c in candidates)
            raise FileNotFoundError(f"Missing chart asset. Tried: {tried}")

        if p.suffix.lower() == ".png":
            m: Mobject = ImageMobject(str(p))
        else:
            m = SVGMobject(str(self._svg_without_text(p)))
            if line_only:
                # Imported SVG line charts should be stroke-only.
                for sm in m.family_members_with_points():
                    sm.set_fill(opacity=0)

        if width is not None:
            m.scale_to_fit_width(width)
        if height is not None:
            m.scale_to_fit_height(height)
        return m

    def _svg_without_text(self, src: Path) -> Path:
        """Return a sanitized SVG copy with text/tspan nodes removed for Manim compatibility."""
        cache_dir = Path(".manim_svg_cache")
        cache_dir.mkdir(exist_ok=True)
        out = cache_dir / f"{src.stem}.notext.svg"

        if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
            return out

        tree = ET.parse(src)
        root = tree.getroot()
        parent_map = {c: p for p in root.iter() for c in p}

        for elem in list(root.iter()):
            tag = elem.tag.split("}")[-1]
            if tag in {"text", "tspan"}:
                parent = parent_map.get(elem)
                if parent is not None:
                    parent.remove(elem)

        tree.write(out, encoding="utf-8", xml_declaration=True)
        return out

    def land_on_png(self, current: Mobject, *names: str, run_time: float = 0.55) -> Mobject:
        search_roots = [Path("."), Path("plots_svg")]
        png_candidates: list[Path] = []

        for name in names:
            n = Path(name)
            if n.suffix.lower() == ".png":
                for root in search_roots:
                    png_candidates.append(root / n.name)
            elif not n.suffix:
                for root in search_roots:
                    png_candidates.append(root / f"{name}.png")

        p = next((c for c in png_candidates if c.exists()), None)
        if p is None:
            return current

        landed = ImageMobject(str(p))
        landed.scale_to_fit_width(current.width)
        landed.move_to(current)
        self.play(FadeOut(current), FadeIn(landed), run_time=run_time)
        return landed

    def card_title(self, title: str, subtitle: str = "") -> VGroup:
        t = Text(title, font_size=44, weight=BOLD, color="#0F172A")
        if subtitle:
            s = Text(subtitle, font_size=24, color="#334155")
            g = VGroup(t, s).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        else:
            g = VGroup(t)
        return g.to_edge(UP, buff=0.4)

    def highlight_region(self, target: Mobject, center: np.ndarray, w: float, h: float, color: str, label: str) -> VGroup:
        rect = RoundedRectangle(corner_radius=0.08, width=w, height=h)
        rect.set_stroke(color=color, width=3)
        rect.set_fill(color=color, opacity=0.08)
        rect.move_to(center)

        tag = Text(label, font_size=22, color=color, weight=BOLD)
        tag.next_to(rect, UP, buff=0.12)
        return VGroup(rect, tag)

    def fade_swap(self, old: Mobject, new: Mobject, shift=UP * 0.25, run_time: float = 0.8) -> None:
        self.play(FadeOut(old, shift=shift), FadeIn(new, shift=shift), run_time=run_time)

    def color_legend(self, items: list[tuple[str, str]], font_size: int = 22) -> VGroup:
        rows = VGroup()
        for label, color in items:
            swatch = Line(LEFT * 0.35, RIGHT * 0.35).set_stroke(color=color, width=7)
            txt = Text(label, font_size=font_size, color="#334155")
            row = VGroup(swatch, txt).arrange(RIGHT, buff=0.2)
            rows.add(row)
        return rows.arrange(DOWN, aligned_edge=LEFT, buff=0.14)

    def construct(self) -> None:
        self.opening_slide()
        self.theory_slides()
        self.timeline_and_26y_bar()
        self.period_deep_dives()
        self.tradeoff_map()
        self.closing_slide()

    def opening_slide(self) -> None:
        title = self.card_title(
            "Can the Fed Control Inflation and Employment?",
            "A 26-year visual scorecard (2000s to 2020s)",
        )

        left = Text("Dual Mandate", font_size=30, color="#1E293B", weight=BOLD)
        bullet1 = Text("1. Stable prices (inflation near 2%)", font_size=24, color="#334155")
        bullet2 = Text("2. Maximum employment (low unemployment)", font_size=24, color="#334155")
        body = VGroup(left, bullet1, bullet2).arrange(DOWN, aligned_edge=LEFT, buff=0.25)
        body.next_to(title, DOWN, buff=0.8).to_edge(LEFT, buff=1.1)

        q = Text("Question: Did policy keep both goals satisfied consistently?", font_size=26, color="#0F172A")
        q.to_edge(DOWN, buff=0.7)

        self.play(FadeIn(title, shift=UP * 0.2))
        self.play(LaggedStart(*[FadeIn(m, shift=RIGHT * 0.15) for m in body], lag_ratio=0.18))
        self.play(Write(q))
        self.wait(1.2)
        self.play(*[FadeOut(m) for m in [title, body, q]])

    def theory_slides(self) -> None:
        header = self.card_title("Policy Theory", "How rates interact with inflation and unemployment over time")

        p1 = self.plot_asset("theory_slide_1_interest_vs_inflation", width=11.6, line_only=True)
        p1.next_to(header, DOWN, buff=0.35)
        leg1 = self.color_legend([("Interest Rate", "#2E8B57"), ("Inflation", "#DC2626")], font_size=20)
        leg1.to_edge(RIGHT, buff=0.35).shift(UP * 0.4)

        self.play(FadeIn(header, shift=UP * 0.15))
        self.play(FadeIn(p1, shift=UP * 0.1), run_time=1.2)
        self.play(FadeIn(leg1, shift=LEFT * 0.1), run_time=0.5)
        p1 = self.land_on_png(p1, "theory_slide_1_interest_vs_inflation")
        self.wait(1.6)

        p2 = self.plot_asset("theory_slide_2_interest_vs_unemployment", width=11.6, line_only=True)
        p2.next_to(header, DOWN, buff=0.35)
        leg2 = self.color_legend([("Interest Rate", "#2E8B57"), ("Unemployment", "#2563EB")], font_size=20)
        leg2.to_edge(RIGHT, buff=0.35).shift(UP * 0.4)
        self.play(FadeOut(p1), FadeOut(leg1), FadeIn(p2), run_time=1.0)
        self.play(FadeIn(leg2, shift=LEFT * 0.1), run_time=0.5)
        p2 = self.land_on_png(p2, "theory_slide_2_interest_vs_unemployment")
        self.wait(1.8)

        self.play(FadeOut(header), FadeOut(p2), FadeOut(leg2))

    def timeline_and_26y_bar(self) -> None:
        header = self.card_title("Mandate Timeline", "Inflation, unemployment, and policy rate through one lens")
        timeline = self.plot_asset("viz1_timeline_combined", width=12.0, line_only=True)
        timeline.next_to(header, DOWN, buff=0.3)

        self.play(FadeIn(header, shift=UP * 0.15))
        self.play(FadeIn(timeline, shift=UP * 0.1), run_time=1.1)
        timeline = self.land_on_png(timeline, "viz1_timeline_combined")
        self.wait(1.4)

        stack = self.plot_asset("viz1_stacked_26y", width=8.5)
        stack.to_edge(DOWN, buff=0.3)

        self.play(timeline.animate.scale(0.78).to_edge(UP, buff=1.3), run_time=0.8)
        self.play(FadeIn(stack, shift=UP * 0.2), run_time=0.8)
        stack = self.land_on_png(stack, "viz1_stacked_26y")

        labels = VGroup(
            Text("Employment", font_size=22, color="#14532D"),
            Text("Inflation", font_size=22, color="#14532D"),
            Text("Both", font_size=22, color="#14532D"),
        ).arrange(RIGHT, buff=1.55)
        labels.next_to(stack, DOWN, buff=0.18)
        self.play(LaggedStart(*[Write(t) for t in labels], lag_ratio=0.2), run_time=1.0)
        self.wait(2.0)

        self.play(FadeOut(header), FadeOut(timeline), FadeOut(stack), FadeOut(labels))

    def period_deep_dives(self) -> None:
        header = self.card_title("Period Deep-Dives", "Each era: unemployment link, inflation link, and benchmark hit-rate")
        self.play(FadeIn(header, shift=UP * 0.15))

        periods = [
            (
                "Dot-com bust (2000-2003)",
                ("period_dotcom_ffr_vs_unemp", "period_dotcom_ffr_vs_unemployment"),
                ("period_dotcom_ffr_vs_infl", "period_dotcom_ffr_vs_inflation"),
                ("period_dotcom_stacked_pct",),
            ),
            (
                "Financial crisis + aftermath (2008-2012)",
                ("period_gfc_ffr_vs_unemp", "period_gfc_ffr_vs_unemployment"),
                ("period_gfc_ffr_vs_infl", "period_gfc_ffr_vs_inflation"),
                ("period_gfc_stacked_pct",),
            ),
            (
                "COVID era (2020-2023)",
                ("period_covid_ffr_vs_unemp", "period_covid_ffr_vs_unemployment"),
                ("period_covid_ffr_vs_infl", "period_covid_ffr_vs_inflation"),
                ("period_covid_stacked_pct",),
            ),
        ]

        active: list[Mobject] = [header]

        for idx, (period_label, u_names, i_names, b_names) in enumerate(periods):
            period_title = Text(period_label, font_size=30, color="#0F172A", weight=BOLD)
            period_title.next_to(header, DOWN, buff=0.28)

            u_plot = self.plot_asset(*u_names, width=4.9, line_only=True)
            i_plot = self.plot_asset(*i_names, width=4.9, line_only=True)
            b_plot = self.plot_asset(*b_names, width=4.4)

            left_stack = Group(u_plot, i_plot).arrange(DOWN, aligned_edge=LEFT, buff=0.35)
            left_stack.to_edge(LEFT, buff=0.6).shift(DOWN * 1.0)
            b_plot.to_edge(RIGHT, buff=0.7).shift(DOWN * 1.0)

            legend = self.color_legend(
                [("Interest Rate", "#2E8B57"), ("Unemployment", "#2563EB"), ("Inflation", "#DC2626")],
                font_size=18,
            )
            legend.to_edge(RIGHT, buff=0.55).shift(UP * 1.35)

            if idx == 0:
                self.play(FadeIn(period_title, shift=UP * 0.1))
                self.play(FadeIn(left_stack, shift=LEFT * 0.2), run_time=0.95)
                self.play(FadeIn(b_plot, shift=RIGHT * 0.2), run_time=0.85)
                self.play(FadeIn(legend, shift=LEFT * 0.1), run_time=0.5)
            else:
                keep = [header]
                remove = [m for m in active if m not in keep]
                self.play(*[FadeOut(m, shift=UP * 0.1) for m in remove], run_time=0.45)
                self.play(FadeIn(period_title, shift=UP * 0.1))
                self.play(FadeIn(left_stack, shift=LEFT * 0.2), run_time=0.9)
                self.play(FadeIn(b_plot, shift=RIGHT * 0.2), run_time=0.75)
                self.play(FadeIn(legend, shift=LEFT * 0.1), run_time=0.5)

            u_plot = self.land_on_png(u_plot, *u_names)
            i_plot = self.land_on_png(i_plot, *i_names)
            b_plot = self.land_on_png(b_plot, *b_names)

            insight = Text(
                "Read: lines show dynamics; bars summarize months meeting benchmarks",
                font_size=22,
                color="#334155",
            )
            insight.to_edge(DOWN, buff=0.2)
            self.play(Write(insight), run_time=0.8)
            self.wait(2.0)

            active = [header, period_title, u_plot, i_plot, b_plot, legend, insight]

        self.play(*[FadeOut(m) for m in active])

    def tradeoff_map(self) -> None:
        header = self.card_title("Tradeoff Map", "Where inflation and unemployment were closest to mandate")
        scatter = self.plot_asset("viz2_tradeoff_scatter", width=11.8)
        scatter.next_to(header, DOWN, buff=0.35)

        self.play(FadeIn(header, shift=UP * 0.15))
        self.play(FadeIn(scatter, shift=UP * 0.15), run_time=1.0)
        scatter = self.land_on_png(scatter, "viz2_tradeoff_scatter")

        # Approximate bottom-left benchmark quadrant highlight
        q_rect = RoundedRectangle(corner_radius=0.08, width=4.5, height=3.0)
        q_rect.set_stroke(color="#16A34A", width=4)
        q_rect.set_fill(color="#22C55E", opacity=0.12)
        q_rect.move_to(scatter.get_corner(DL) + RIGHT * 2.4 + UP * 1.5)

        q_label = Text("Closest to dual mandate", font_size=24, color="#166534", weight=BOLD)
        q_label.next_to(q_rect, UP, buff=0.1)

        self.play(Create(q_rect), Write(q_label), run_time=0.9)
        self.wait(1.8)

        self.play(FadeOut(header), FadeOut(scatter), FadeOut(q_rect), FadeOut(q_label))

    def closing_slide(self) -> None:
        title = self.card_title("Takeaway", "The Fed restores after shocks, but cannot keep both goals perfect")

        points = VGroup(
            Text("• Best dual-mandate stretch: late 2010s", font_size=28, color="#0F172A"),
            Text("• Employment miss: recession and pandemic shocks", font_size=28, color="#0F172A"),
            Text("• Inflation miss: 2021-2023 surge", font_size=28, color="#0F172A"),
            Text("• Use period bars + timeline for clear narrative pacing", font_size=28, color="#0F172A"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.32)
        points.next_to(title, DOWN, buff=0.8).to_edge(LEFT, buff=1.0)

        end = Text("SVG-first pipeline ready for Manim scene reuse", font_size=22, color="#334155")
        end.to_edge(DOWN, buff=0.6)

        self.play(FadeIn(title, shift=UP * 0.2))
        self.play(LaggedStart(*[FadeIn(p, shift=RIGHT * 0.1) for p in points], lag_ratio=0.2), run_time=1.4)
        self.play(Write(end))
        self.wait(2.8)


__all__ = ["Story2Slideshow"]
