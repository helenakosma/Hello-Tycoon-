// Reference solutions for every Python problem, used only to validate the bank.
const d = (s) => s.replace(/^\n/, '').replace(/\n[ \t]*$/, '').split('\n')
  .map((l) => l.replace(/^ {6}/, '')).join('\n');

export default {
  'py-out-01': d(`
      print("Hello, Tycoon!")
  `),
  'py-out-02': d(`
      company = "Bitwise Inc"
      print("Welcome to " + company)
  `),
  'py-out-03': d(`
      def area(width, height):
          return width * height
  `),
  'py-out-04': d(`
      def sprint_seconds(days):
          return days * 24 * 60 * 60
  `),
  'py-out-05': d(`
      def to_fahrenheit(celsius):
          return celsius * 9 / 5 + 32
  `),
  'py-out-06': d(`
      def average(a, b, c):
          return (a + b + c) / 3
  `),

  'py-cond-01': d(`
      def is_even(n):
          return n % 2 == 0
  `),
  'py-cond-02': d(`
      def bigger(a, b):
          if a > b:
              return a
          else:
              return b
  `),
  'py-cond-03': d(`
      def grade(score):
          if score >= 90:
              return "A"
          elif score >= 80:
              return "B"
          elif score >= 70:
              return "C"
          elif score >= 60:
              return "D"
          else:
              return "F"
  `),
  'py-cond-04': d(`
      def fizz_buzz(n):
          if n % 3 == 0 and n % 5 == 0:
              return "FizzBuzz"
          if n % 3 == 0:
              return "Fizz"
          if n % 5 == 0:
              return "Buzz"
          return str(n)
  `),
  'py-cond-05': d(`
      def is_leap(year):
          return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
  `),

  'py-loop-01': d(`
      for i in range(1, 6):
          print(i)
  `),
  'py-loop-02': d(`
      def sum_to(n):
          total = 0
          for i in range(1, n + 1):
              total += i
          return total
  `),
  'py-loop-03': d(`
      for i in range(1, 6):
          print(f"7 x {i} = {7 * i}")
  `),
  'py-loop-04': d(`
      def factorial(n):
          result = 1
          for i in range(1, n + 1):
              result *= i
          return result
  `),
  'py-loop-05': d(`
      def deploys_needed(failures):
          rounds = 0
          while failures > 0:
              failures = failures // 2
              rounds += 1
          return rounds
  `),
  'py-loop-06': d(`
      for i in range(1, 16):
          if i % 3 == 0 and i % 5 == 0:
              print("FizzBuzz")
          elif i % 3 == 0:
              print("Fizz")
          elif i % 5 == 0:
              print("Buzz")
          else:
              print(i)
  `),

  'py-func-01': d(`
      def max_of_three(a, b, c):
          return max(a, max(b, c))
  `),
  'py-func-02': d(`
      def apply_discount(price, percent):
          return price - price * percent / 100
  `),
  'py-func-03': d(`
      def is_prime(n):
          if n < 2:
              return False
          i = 2
          while i * i <= n:
              if n % i == 0:
                  return False
              i += 1
          return True
  `),
  'py-func-04': d(`
      def gcd(a, b):
          while b != 0:
              a, b = b, a % b
          return a
  `),
  'py-func-05': d(`
      def balance(principal, rate, years):
          amount = principal
          for _ in range(years):
              amount = amount * (1 + rate / 100)
          return round(amount, 2)
  `),

  'py-arr-01': d(`
      def total(numbers):
          running = 0
          for n in numbers:
              running += n
          return running
  `),
  'py-arr-02': d(`
      def largest(numbers):
          best = numbers[0]
          for n in numbers:
              if n > best:
                  best = n
          return best
  `),
  'py-arr-03': d(`
      def count_above(numbers, threshold):
          count = 0
          for n in numbers:
              if n > threshold:
                  count += 1
          return count
  `),
  'py-arr-04': d(`
      def reverse(items):
          result = []
          for i in range(len(items) - 1, -1, -1):
              result.append(items[i])
          return result
  `),
  'py-arr-05': d(`
      def second_largest(numbers):
          unique = sorted(set(numbers))
          if len(unique) < 2:
              return None
          return unique[-2]
  `),

  'py-str-01': d(`
      def shout(text):
          return text.upper() + "!"
  `),
  'py-str-02': d(`
      def count_vowels(text):
          count = 0
          for letter in text:
              if letter.lower() in "aeiou":
                  count += 1
          return count
  `),
  'py-str-03': d(`
      def is_palindrome(text):
          clean = text.lower().replace(" ", "")
          return clean == clean[::-1]
  `),
  'py-str-04': d(`
      def initials(full_name):
          result = ""
          for word in full_name.split():
              result += word[0].upper() + "."
          return result
  `),
  'py-str-05': d(`
      def longest_word(sentence):
          words = sentence.split()
          best = words[0]
          for word in words:
              if len(word) > len(best):
                  best = word
          return best
  `),

  'py-oop-01': d(`
      class Employee:
          def __init__(self, name, salary):
              self.name = name
              self.salary = salary

          def describe(self):
              return f"{self.name} earns {self.salary}"


      # --- do not change below this line ---
      e = Employee("Ada", 90000)
      print(e.describe())
      print(Employee("Linus", 50000).describe())
  `),
  'py-oop-02': d(`
      class BankAccount:
          def __init__(self, starting):
              self.balance = starting

          def deposit(self, amount):
              self.balance += amount

          def withdraw(self, amount):
              if amount <= self.balance:
                  self.balance -= amount

          def get_balance(self):
              return self.balance


      # --- do not change below this line ---
      acct = BankAccount(100)
      acct.deposit(50)
      print(acct.get_balance())
      acct.withdraw(30)
      print(acct.get_balance())
      acct.withdraw(9999)
      print(acct.get_balance())
  `),
  'py-oop-03': d(`
      class Room:
          def __init__(self, width, height):
              self.width = width
              self.height = height

          def area(self):
              return self.width * self.height

          def perimeter(self):
              return 2 * self.width + 2 * self.height

          def is_square(self):
              return self.width == self.height


      # --- do not change below this line ---
      r = Room(4, 6)
      print(r.area())
      print(r.perimeter())
      print(r.is_square())
      print(Room(5, 5).is_square())
  `),
  'py-oop-04': d(`
      class Employee:
          def __init__(self, name):
              self.name = name

          def describe(self):
              return self.name + " writes code"


      class Manager(Employee):
          def __init__(self, name, team_size):
              super().__init__(name)
              self.team_size = team_size

          def describe(self):
              return f"{self.name} manages {self.team_size} people"


      # --- do not change below this line ---
      print(Employee("Ada").describe())
      print(Manager("Grace", 4).describe())
  `),

  'py-rec-01': d(`
      def factorial(n):
          if n <= 1:
              return 1
          return n * factorial(n - 1)
  `),
  'py-rec-02': d(`
      def fib(n):
          if n == 0:
              return 0
          if n == 1:
              return 1
          return fib(n - 1) + fib(n - 2)
  `),
  'py-rec-03': d(`
      def digit_sum(n):
          if n == 0:
              return 0
          return n % 10 + digit_sum(n // 10)
  `),
  'py-rec-04': d(`
      def power(base, exponent):
          if exponent == 0:
              return 1
          return base * power(base, exponent - 1)
  `),
};
