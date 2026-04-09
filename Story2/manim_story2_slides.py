from __future__ import annotations

from manim import *
from manim_slides import Slide

from manim_story2_slideshow import Story2Slideshow


class Story2Slides(Slide, Story2Slideshow):
    """Interactive slide-by-slide version (HTML via manim-slides)."""

    def construct(self) -> None:
        self.slide_opening()
        self.slide_theory_1()
        self.slide_theory_2()
        self.slide_timeline()
        self.slide_stacked_26y()
        self.slide_period(
            "Dot-com bust (2000-2003)",
            ("period_dotcom_ffr_vs_unemp", "period_dotcom_ffr_vs_unemployment"),
            ("period_dotcom_ffr_vs_infl", "period_dotcom_ffr_vs_inflation"),
            ("period_dotcom_stacked_pct",),
        )
        self.slide_period(
            "Financial crisis + aftermath (2008-2012)",
            ("period_gfc_ffr_vs_unemp", "period_gfc_ffr_vs_unemployment"),
            ("period_gfc_ffr_vs_infl", "period_gfc_ffr_vs_inflation"),
            ("period_gfc_stacked_pct",),
        )
        self.slide_period(
            "COVID era (2020-2023)",
            ("period_covid_ffr_vs_unemp", "period_covid_ffr_vs_unemployment"),
            ("period_covid_ffr_vs_infl", "period_covid_ffr_vs_inflation"),
            ("period_covid_stacked_pct",),
        )
        self.slide_tradeoff()
        self.slide_closing()

    def hold_then_clear(self, *mobs: Mobject) -> None:
        self.next_slide()
        self.play(*[FadeOut(m) for m in mobs], run_time=0.35)

    def slide_opening(self) -> None:
        title = self.card_title(
            "Can the Fed Control Inflation and Employment?",
            "A 26-year visual scorecard (2000s to 2020s)",
        )
        left = self.title_text("Dual Mandate", font_size=30, color="#1E293B")
        bullet1 = self.body_text("1. Stable prices (inflation near 2%)", font_size=24)
        bullet2 = self.body_text("2. Maximum employment (unemployment near 4%-5%)", font_size=24)
        body = VGroup(left, bullet1, bullet2).arrange(DOWN, aligned_edge=LEFT, buff=0.25)
        body.next_to(title, DOWN, buff=0.8).to_edge(LEFT, buff=1.1)
        q = self.body_text("Question: Did policy keep both goals satisfied consistently?", font_size=26, color="#0F172A")
        q.to_edge(DOWN, buff=0.7)

        self.play(FadeIn(title, shift=UP * 0.2))
        self.play(FadeIn(body, shift=RIGHT * 0.12))
        self.play(Write(q))
        self.hold_then_clear(title, body, q)

    def slide_theory_1(self) -> None:
        header = self.card_title("Policy Theory", "How rates interact with inflation and unemployment over time")
        p1 = self.plot_asset("theory_slide_1_interest_vs_inflation", width=8.4)
        p1.next_to(header, DOWN, buff=0.35)
        self.play(FadeIn(header), FadeIn(p1, shift=UP * 0.1), run_time=0.9)
        self.hold_then_clear(header, p1)

    def slide_theory_2(self) -> None:
        header = self.card_title("Policy Theory", "How rates interact with inflation and unemployment over time")
        p2 = self.plot_asset("theory_slide_2_interest_vs_unemployment", width=8.4)
        p2.next_to(header, DOWN, buff=0.35)
        self.play(FadeIn(header), FadeIn(p2, shift=UP * 0.1), run_time=0.9)
        self.hold_then_clear(header, p2)

    def slide_timeline(self) -> None:
        header = self.card_title("Mandate Timeline", "Inflation, unemployment, and policy rate through one lens")
        timeline = self.plot_asset("viz1_timeline_combined", width=7.1)
        timeline.next_to(header, DOWN, buff=0.3).shift(UP * 0.07)
        self.play(FadeIn(header), FadeIn(timeline, shift=UP * 0.1), run_time=0.9)
        self.hold_then_clear(header, timeline)

    def slide_stacked_26y(self) -> None:
        header = self.card_title("26-Year Mandate Split", "How often each outcome occurred over the full sample")
        stack = self.plot_asset("viz1_stacked_26y", width=8.8)
        stack.next_to(header, DOWN, buff=0.35)
        support = self.body_text(
            "This shows how the Fed did over 26 years, next we look at specific periods.",
            font_size=22,
            color="#0F172A",
        )
        support.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(header), FadeIn(stack, shift=UP * 0.12), run_time=0.9)
        self.play(Write(support), run_time=0.5)
        self.hold_then_clear(header, stack, support)

    def slide_period(self, label: str, u_names: tuple[str, ...], i_names: tuple[str, ...], b_names: tuple[str, ...]) -> None:
        header = self.card_title("Period Deep-Dives", "Each era: unemployment link, inflation link, and benchmark hit-rate")
        period_title = self.title_text(label, font_size=30, color="#0F172A")
        period_title.next_to(header, DOWN, buff=0.16)

        u_plot = self.plot_asset(*u_names, width=4.95)
        i_plot = self.plot_asset(*i_names, width=4.95)
        b_plot = self.plot_asset(*b_names, width=6.4)

        left_stack = Group(u_plot, i_plot).arrange(DOWN, aligned_edge=LEFT, buff=0.35)
        left_stack.to_edge(LEFT, buff=0.65).shift(DOWN * 1.15)
        u_plot.shift(UP * 0.07)
        b_plot.to_edge(RIGHT, buff=0.8).shift(DOWN * 1.15)
        score_title = self.title_text("How did the Fed Score?", font_size=28, color="#0F172A")
        score_title.next_to(b_plot, UP, buff=0.18)

        self.play(FadeIn(header), FadeIn(period_title, shift=UP * 0.08), run_time=0.7)
        self.play(FadeIn(left_stack, shift=LEFT * 0.15), run_time=0.8)
        self.play(FadeIn(score_title, shift=UP * 0.08), FadeIn(b_plot, shift=RIGHT * 0.15), run_time=0.8)
        self.hold_then_clear(header, period_title, u_plot, i_plot, score_title, b_plot)

    def slide_tradeoff(self) -> None:
        header = self.card_title("Tradeoff Map", "Where inflation and unemployment were closest to mandate")
        scatter = self.plot_asset("viz2_tradeoff_scatter", width=11.8)
        scatter.next_to(header, DOWN, buff=0.35)
        q_rect = RoundedRectangle(corner_radius=0.08, width=1.3, height=2.5)
        q_rect.set_stroke(color="#16A34A", width=0)
        q_rect.set_fill(color="#22C55E", opacity=0.12)
        # Pixel-style nudges for easier tuning.
        px_to_unit = config.frame_width / config.pixel_width
        left_shift_px = 100
        up_shift_px = 50
        q_rect.move_to(
            scatter.get_corner(DL)
            + RIGHT * (1.75 - left_shift_px * px_to_unit)
            + UP * (1.1 + up_shift_px * px_to_unit)
        )
        q_label = self.title_text("Closest to dual mandate", font_size=24, color="#166534")
        q_label.next_to(q_rect, UP, buff=0.1)

        self.play(FadeIn(header), FadeIn(scatter, shift=UP * 0.1), run_time=0.8)
        self.wait(1.0)
        self.play(FadeIn(q_rect), Write(q_label), run_time=0.6)
        self.hold_then_clear(header, scatter, q_rect, q_label)

    def slide_closing(self) -> None:
        title = self.card_title("Takeaway", "The Fed restores after shocks, but cannot keep both goals perfect")
        points = VGroup(
            self.body_text("• Best dual-mandate stretch: late 2010s", font_size=28, color="#0F172A"),
            self.body_text("• Employment miss: recession and pandemic shocks", font_size=28, color="#0F172A"),
            self.body_text("• Inflation miss: 2021-2023 surge", font_size=28, color="#0F172A"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.32)
        points.next_to(title, DOWN, buff=0.8).to_edge(LEFT, buff=1.0)
        self.play(FadeIn(title, shift=UP * 0.1), FadeIn(points, shift=RIGHT * 0.1), run_time=1.0)
        self.next_slide()


__all__ = ["Story2Slides"]
