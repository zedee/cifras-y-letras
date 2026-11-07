import pytest
from backend.engine.numbers import NumberEngine

def test_generate_numbers():
    engine = NumberEngine()
    nums = engine.generate_numbers()
    assert len(nums) == 6
    for n in nums:
        assert n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100]

def test_solve_logic():
    engine = NumberEngine()
    # Test a known simple case: 5 + 5 = 10
    val, path = engine.solve([5, 5, 100, 100, 100, 100], 10)
    assert val == 10
    assert "(5 + 5)" in " ".join(path)