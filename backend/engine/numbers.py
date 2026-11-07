import random
from typing import List, Tuple, Optional, Union

class NumberEngine:
    def __init__(self):
        # Weights: 1-10 are common, 25-100 are increasingly rare
        self.pool = [
            (i, 10) for i in range(1, 11)
        ] + [
            (25, 5), (50, 3), (75, 2), (100, 1)
        ]

    def generate_numbers(self) -> List[int]:
        """Generates 6 numbers based on the weighted distribution."""
        numbers = []
        population = []
        for val, weight in self.pool:
            population.extend([val] * weight)
        
        for _ in range(6):
            numbers.append(random.choice(population))
        return numbers

    def solve(self, numbers: List[int], target: int) -> Tuple[int, List[str]]:
        """
        Finds the best calculation to reach the target.
        Returns: (best_value, list_of_steps)
        """
        best_val = -1
        best_path = []
        
        # We use a recursive search to find all possible valid combinations
        # The state is a list of current available numbers
        def backtrack(current_numbers: List[int], path: List[str]):
            nonlocal best_val, best_path
            
            # Base case: if only one number left, check against target
            if len(current_numbers) == 1:
                val = current_numbers[0]
                if abs(target - val) < abs(target - best_val) if best_val != -1 else True:
                    best_val = val
                    best_path = list(path)
                return

            # Try every pair of numbers
            for i in range(len(current_numbers)):
                for j in range(len(current_numbers)):
                    if i == j: continue
                    
                    a = current_numbers[i]
                    b = current_numbers[j]
                    
                    # Remaining numbers for the next step
                    remaining = [current_numbers[k] for k in range(len(current_numbers)) 
                                 if k != i and k != j]

                    # Try all 4 operations
                    # Addition
                    self._try_op(a + b, f"({a} + {b})", remaining, path, backtrack)
                    # Subtraction
                    if a - b > 0:
                        self._try_op(a - b, f"({a} - {b})", remaining, path, backtrack)
                    # Multiplication
                    self._try_op(a * b, f"({a} * {b})", remaining, path, backtrack)
                    # Division
                    if b != 0 and a % b == 0:
                        self._try_op(a // b, f"({a} / {b})", remaining, path, backtrack)

        # Initial call
        backtrack(numbers, [])
        return best_val, best_path

    def _try_op(self, result: int, step_str: str, remaining: List[int], 
                 path: List[str], backtrack_func):
        # Only proceed if the result is a positive integer
        if result > 0:
            new_numbers = remaining + [result]
            backtrack_func(new_numbers, path + [step_str])

# Example Usage for testing:
if __name__ == "__main__":
    engine = NumberEngine()
    nums = engine.generate_numbers()
    target = random.randint(101, 999)
    print(f"Numbers: {nums}")
    print(f"Target: {target}")
    
    val, path = engine.solve(nums, target)
    print(f"Best Value: {val}")
    print(f"Path: {' '.join(path)}")