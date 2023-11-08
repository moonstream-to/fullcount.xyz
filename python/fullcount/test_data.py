import unittest

from . import data


class DataTests(unittest.TestCase):
    def test_distance_highb_insideb_highb_insideb_fast_contact(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Fast,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.InsideBall,
                data.SwingType.Contact,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.InsideBall,
            ),
            0,
        )

    def test_distance_lows_mid_lows_outsideb_fast_contact(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Fast,
                data.VerticalLocation.LowStrike,
                data.HorizontalLocation.Middle,
                data.SwingType.Contact,
                data.VerticalLocation.LowStrike,
                data.HorizontalLocation.OutsideBall,
            ),
            2,
        )

    def test_distance_mid_outs_highs_outs_fast_contact(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Fast,
                data.VerticalLocation.Middle,
                data.HorizontalLocation.OutsideStrike,
                data.SwingType.Contact,
                data.VerticalLocation.HighStrike,
                data.HorizontalLocation.OutsideStrike,
            ),
            1,
        )

    def test_distance_mid_mid_highs_outs_fast_contact(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Fast,
                data.VerticalLocation.Middle,
                data.HorizontalLocation.Middle,
                data.SwingType.Contact,
                data.VerticalLocation.HighStrike,
                data.HorizontalLocation.OutsideStrike,
            ),
            2,
        )

    def test_distance_highb_outb_lowb_inb_fast_contact(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Fast,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.OutsideBall,
                data.SwingType.Contact,
                data.VerticalLocation.LowBall,
                data.HorizontalLocation.InsideBall,
            ),
            8,
        )

    def test_distance_highb_insideb_highb_insideb_fast_power(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Fast,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.InsideBall,
                data.SwingType.Power,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.InsideBall,
            ),
            1,
        )

    def test_distance_lows_mid_lows_outsideb_fast_power(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Fast,
                data.VerticalLocation.LowStrike,
                data.HorizontalLocation.Middle,
                data.SwingType.Power,
                data.VerticalLocation.LowStrike,
                data.HorizontalLocation.OutsideBall,
            ),
            3,
        )

    def test_distance_mid_outs_highs_outs_fast_power(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Fast,
                data.VerticalLocation.Middle,
                data.HorizontalLocation.OutsideStrike,
                data.SwingType.Power,
                data.VerticalLocation.HighStrike,
                data.HorizontalLocation.OutsideStrike,
            ),
            2,
        )

    def test_distance_mid_mid_highs_outs_fast_power(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Fast,
                data.VerticalLocation.Middle,
                data.HorizontalLocation.Middle,
                data.SwingType.Power,
                data.VerticalLocation.HighStrike,
                data.HorizontalLocation.OutsideStrike,
            ),
            3,
        )

    def test_distance_highb_outb_lowb_inb_fast_power(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Fast,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.OutsideBall,
                data.SwingType.Power,
                data.VerticalLocation.LowBall,
                data.HorizontalLocation.InsideBall,
            ),
            9,
        )

    def test_distance_highb_insideb_highb_insideb_slow_contact(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Slow,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.InsideBall,
                data.SwingType.Contact,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.InsideBall,
            ),
            1,
        )

    def test_distance_lows_mid_lows_outsideb_slow_contact(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Slow,
                data.VerticalLocation.LowStrike,
                data.HorizontalLocation.Middle,
                data.SwingType.Contact,
                data.VerticalLocation.LowStrike,
                data.HorizontalLocation.OutsideBall,
            ),
            3,
        )

    def test_distance_mid_outs_highs_outs_slow_contact(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Slow,
                data.VerticalLocation.Middle,
                data.HorizontalLocation.OutsideStrike,
                data.SwingType.Contact,
                data.VerticalLocation.HighStrike,
                data.HorizontalLocation.OutsideStrike,
            ),
            2,
        )

    def test_distance_mid_mid_highs_outs_slow_contact(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Slow,
                data.VerticalLocation.Middle,
                data.HorizontalLocation.Middle,
                data.SwingType.Contact,
                data.VerticalLocation.HighStrike,
                data.HorizontalLocation.OutsideStrike,
            ),
            3,
        )

    def test_distance_highb_outb_lowb_inb_slow_contact(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Slow,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.OutsideBall,
                data.SwingType.Contact,
                data.VerticalLocation.LowBall,
                data.HorizontalLocation.InsideBall,
            ),
            9,
        )

    def test_distance_highb_insideb_highb_insideb_slow_power(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Slow,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.InsideBall,
                data.SwingType.Power,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.InsideBall,
            ),
            0,
        )

    def test_distance_lows_mid_lows_outsideb_slow_power(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Slow,
                data.VerticalLocation.LowStrike,
                data.HorizontalLocation.Middle,
                data.SwingType.Power,
                data.VerticalLocation.LowStrike,
                data.HorizontalLocation.OutsideBall,
            ),
            2,
        )

    def test_distance_mid_outs_highs_outs_slow_power(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Slow,
                data.VerticalLocation.Middle,
                data.HorizontalLocation.OutsideStrike,
                data.SwingType.Power,
                data.VerticalLocation.HighStrike,
                data.HorizontalLocation.OutsideStrike,
            ),
            1,
        )

    def test_distance_mid_mid_highs_outs_slow_power(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Slow,
                data.VerticalLocation.Middle,
                data.HorizontalLocation.Middle,
                data.SwingType.Power,
                data.VerticalLocation.HighStrike,
                data.HorizontalLocation.OutsideStrike,
            ),
            2,
        )

    def test_distance_highb_outb_lowb_inb_slow_power(self):
        self.assertEqual(
            data.l1_distance(
                data.PitchType.Slow,
                data.VerticalLocation.HighBall,
                data.HorizontalLocation.OutsideBall,
                data.SwingType.Power,
                data.VerticalLocation.LowBall,
                data.HorizontalLocation.InsideBall,
            ),
            8,
        )


if __name__ == "__main__":
    unittest.main()
