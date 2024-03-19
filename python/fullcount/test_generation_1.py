import unittest

from . import generation_1


class Generation1Tests(unittest.TestCase):
    def test_outcome_weights(self):
        outcome_types = {
            "Distance0": generation_1.Distance0,
            "Distance1": generation_1.Distance1,
            "Distance2": generation_1.Distance2,
            "Distance3": generation_1.Distance3,
            "Distance4": generation_1.Distance4,
            "DistanceGT4": generation_1.DistanceGT4,
        }

        for name, outcome_type in outcome_types.items():
            self.assertEqual(
                len(outcome_type),
                8,
                f"{name} -- distribution should be over 8 outcomes",
            )
            self.assertEqual(
                sum(outcome_type), 10000, f"{name} -- weights do not sum to 10000"
            )
            for item in outcome_type:
                self.assertIsInstance(
                    item,
                    int,
                    f"{name} -- probabilities should be integers representing 0.01% masses",
                )
                self.assertGreaterEqual(
                    item, 0, f"{name} -- probabilities should be >= 0"
                )
                self.assertLessEqual(
                    item, 10000, f"{name} -- probabilities should be <= 10000"
                )


if __name__ == "__main__":
    unittest.main()
