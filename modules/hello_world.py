"""
wordle_check.py — score a Wordle guess against the secret answer.

Given a 5-letter guess and the secret answer, return feedback for each
letter position:

    "green"  -> correct letter, correct position
    "yellow" -> letter is in the word, but a different position
    "gray"   -> letter is not in the word

Example:
    >>> score_guess("trace", "slate")
    ['yellow', 'gray', 'green', 'gray', 'green']
"""

WORD_LENGTH = 5

EMOJI = {"green": "\U0001F7E9", "yellow": "\U0001F7E8", "gray": "⬜"}


def score_guess(guess, answer):
    guess = guess.lower()
    answer = answer.lower()

    result = []
    for i in range(WORD_LENGTH):
        g = guess[i]
        if g == answer[i]:
            result.append("green")
        elif g in answer:
            result.append("yellow")
        else:
            result.append("gray")
    return result


def render(guess, answer):
    pattern = score_guess(guess, answer)
    squares = "".join(EMOJI[p] for p in pattern)
    return f"{guess.upper()}  {squares}"


if __name__ == "__main__":
    # A few sample rounds. The answer is SLATE.
    print(render("trace", "slate"))
    print(render("crane", "slate"))
    print(render("eerie", "slate"))
