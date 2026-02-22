from __future__ import annotations

from pathlib import Path

from manim import *


config.background_color = "#F8FAFC"


class Story2Slideshow(Scene):
    """Manim slideshow driven by SVG exports from Story2_updated.rmd."""

    def svg(self, name: str, width: float | None = None, height: float | None = None) -> SVGMobject:
        p = Path("plots_svg") / name
        if not p.exists():
            raise FileNotFoundError(f"Missing SVG: {p}")
        m = SVGMobject(str(p))
        if width is not None:
            m.scale_to_fit_width(width)
        if height is not None:
            m.scale_to_fit_height(height)
        return m

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

        p1 = self.svg("theory_slide_1_interest_vs_inflation.svg", width=11.6)
        p1.next_to(header, DOWN, buff=0.35)

        self.play(FadeIn(header, shift=UP * 0.15))
        self.play(DrawBorderThenFill(p1), run_time=1.7)

        band_note = Text("Light red band = inflation target margin", font_size=24, color="#B91C1C")
        band_note.to_edge(DOWN, buff=0.5)
        band_box = self.highlight_region(
            p1,
            center=p1.get_center() + DOWN * 0.2,
            w=10.9,
            h=1.1,
            color="#DC2626",
            label="Inflation target zone",
        )
        self.play(FadeIn(band_box[0]), Write(band_box[1]), Write(band_note))
        self.wait(1.0)

        p2 = self.svg("theory_slide_2_interest_vs_unemployment.svg", width=11.6)
        p2.next_to(header, DOWN, buff=0.35)
        self.play(FadeOut(p1), FadeOut(band_box), FadeOut(band_note), FadeIn(p2), run_time=1.0)

        band_note2 = Text("Light blue band = unemployment benchmark margin", font_size=24, color="#1D4ED8")
        band_note2.to_edge(DOWN, buff=0.5)
        band_box2 = self.highlight_region(
            p2,
            center=p2.get_center() + UP * 0.2,
            w=10.9,
            h=1.1,
            color="#2563EB",
            label="Unemployment benchmark zone",
        )
        self.play(FadeIn(band_box2[0]), Write(band_box2[1]), Write(band_note2))
        self.wait(1.2)

        self.play(FadeOut(header), FadeOut(p2), FadeOut(band_box2), FadeOut(band_note2))

    def timeline_and_26y_bar(self) -> None:
        header = self.card_title("Mandate Timeline", "Inflation, unemployment, and policy rate through one lens")
        timeline = self.svg("viz1_timeline_combined.svg", width=12.0)
        timeline.next_to(header, DOWN, buff=0.3)

        self.play(FadeIn(header, shift=UP * 0.15))
        self.play(FadeIn(timeline, shift=UP * 0.1), run_time=1.1)

        top = self.highlight_region(timeline, timeline.get_center() + UP * 1.8, w=11.6, h=2.2, color="#DC2626", label="Inflation")
        mid = self.highlight_region(timeline, timeline.get_center() + UP * 0.0, w=11.6, h=2.2, color="#2563EB", label="Unemployment")
        bot = self.highlight_region(timeline, timeline.get_center() + DOWN * 1.8, w=11.6, h=2.2, color="#15803D", label="Policy Rate")

        self.play(FadeIn(top), run_time=0.5)
        self.wait(0.5)
        self.play(ReplacementTransform(top, mid), run_time=0.6)
        self.wait(0.5)
        self.play(ReplacementTransform(mid, bot), run_time=0.6)
        self.wait(0.5)
        self.play(FadeOut(bot), run_time=0.4)

        stack = self.svg("viz1_stacked_26y.svg", width=8.5)
        stack.to_edge(DOWN, buff=0.3)

        self.play(timeline.animate.scale(0.78).to_edge(UP, buff=1.3), run_time=0.8)
        self.play(FadeIn(stack, shift=UP * 0.2), run_time=0.8)

        labels = VGroup(
            Text("Employment", font_size=22, color="#14532D"),
            Text("Inflation", font_size=22, color="#14532D"),
            Text("Both", font_size=22, color="#14532D"),
        ).arrange(RIGHT, buff=1.55)
        labels.next_to(stack, DOWN, buff=0.18)
        self.play(LaggedStart(*[Write(t) for t in labels], lag_ratio=0.2), run_time=1.0)
        self.wait(1.0)

        self.play(FadeOut(header), FadeOut(timeline), FadeOut(stack), FadeOut(labels))

    def period_deep_dives(self) -> None:
        header = self.card_title("Period Deep-Dives", "Each era: unemployment link, inflation link, and benchmark hit-rate")
        self.play(FadeIn(header, shift=UP * 0.15))

        periods = [
            (
                "Dot-com bust (2000-2003)",
                "period_dotcom_ffr_vs_unemployment.svg",
                "period_dotcom_ffr_vs_inflation.svg",
                "period_dotcom_stacked_pct.svg",
            ),
            (
                "Financial crisis + aftermath (2008-2012)",
                "period_gfc_ffr_vs_unemployment.svg",
                "period_gfc_ffr_vs_inflation.svg",
                "period_gfc_stacked_pct.svg",
            ),
            (
                "COVID era (2020-2023)",
                "period_covid_ffr_vs_unemployment.svg",
                "period_covid_ffr_vs_inflation.svg",
                "period_covid_stacked_pct.svg",
            ),
        ]

        active: list[Mobject] = [header]

        for idx, (period_label, u_file, i_file, b_file) in enumerate(periods):
            period_title = Text(period_label, font_size=30, color="#0F172A", weight=BOLD)
            period_title.next_to(header, DOWN, buff=0.28)

            u_plot = self.svg(u_file, width=5.8).to_corner(UL, buff=0.5).shift(DOWN * 0.7)
            i_plot = self.svg(i_file, width=5.8).to_corner(UR, buff=0.5).shift(DOWN * 0.7)
            b_plot = self.svg(b_file, width=7.2).to_edge(DOWN, buff=0.3)

            if idx == 0:
                self.play(FadeIn(period_title, shift=UP * 0.1))
                self.play(FadeIn(u_plot, shift=LEFT * 0.2), FadeIn(i_plot, shift=RIGHT * 0.2), run_time=1.0)
                self.play(FadeIn(b_plot, shift=UP * 0.2), run_time=0.8)
            else:
                keep = [header]
                remove = [m for m in active if m not in keep]
                self.play(*[FadeOut(m, shift=UP * 0.1) for m in remove], run_time=0.45)
                self.play(FadeIn(period_title, shift=UP * 0.1))
                self.play(FadeIn(u_plot, shift=LEFT * 0.2), FadeIn(i_plot, shift=RIGHT * 0.2), run_time=0.9)
                self.play(FadeIn(b_plot, shift=UP * 0.2), run_time=0.75)

            insight = Text(
                "Read: lines show dynamics; bars summarize months meeting benchmarks",
                font_size=22,
                color="#334155",
            )
            insight.to_edge(DOWN, buff=0.05)
            self.play(Write(insight), run_time=0.8)
            self.wait(1.1)

            active = [header, period_title, u_plot, i_plot, b_plot, insight]

        self.play(*[FadeOut(m) for m in active])

    def tradeoff_map(self) -> None:
        header = self.card_title("Tradeoff Map", "Where inflation and unemployment were closest to mandate")
        scatter = self.svg("viz2_tradeoff_scatter.svg", width=11.8)
        scatter.next_to(header, DOWN, buff=0.35)

        self.play(FadeIn(header, shift=UP * 0.15))
        self.play(FadeIn(scatter, shift=UP * 0.15), run_time=1.0)

        # Approximate bottom-left benchmark quadrant highlight
        q_rect = RoundedRectangle(corner_radius=0.08, width=4.5, height=3.0)
        q_rect.set_stroke(color="#16A34A", width=4)
        q_rect.set_fill(color="#22C55E", opacity=0.12)
        q_rect.move_to(scatter.get_corner(DL) + RIGHT * 2.4 + UP * 1.5)

        q_label = Text("Closest to dual mandate", font_size=24, color="#166534", weight=BOLD)
        q_label.next_to(q_rect, UP, buff=0.1)

        self.play(Create(q_rect), Write(q_label), run_time=0.9)
        self.wait(1.2)

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
        self.wait(2.0)


__all__ = ["Story2Slideshow"]
