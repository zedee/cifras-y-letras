Let's have some fun together building a challenging game!

# A bit of context and history of the game.
"Cifras y Letras" is the spanish version of a popular game show called "Des chiffres et des lettres".
This show is also very popular in the UK, and it's called "Countdown", one of the longest-running shows in
the world, which is still aired on British Channel 4.
In this game show, two contestants must make it through a certain number of rounds, during which they are asked a question related to either numbers or letters.

## The rounds with questions involving numbers:
- In questions involving numbers, contestants are presented with a series of six numbers chosen at random from a group consisting of the integers 1 through 10 inclusive, 25, 50, 75, and 100. It is possible for the same number to be chosen more than once. A random three-digit target number from 101 to 999 is then generated, and the contestants are given 40 seconds to work out a series of calculations whose final total is equal to that target. They may only use the four basic arithmetic operations of addition, subtraction, multiplication, and division, and do not have to use all six numbers. Only positive integers may be obtained at any step, and no number may be used more times than it appears in the selection.
- Numbers 25, 50, 75 and 100 appear with far less frequency than the ordinary integers from 1 to 10. The higher the number over 10, the lesser the chance this number pops out.
- Contestants signal that they have obtained the target number by inputting "Exacto", then give the details of their calculations. Ten points are awarded for reaching the target exactly, or for coming as close as possible if an exact solution cannot be reached.
- If neither contestant obtains the best possible solution, the one who comes closest to the target scores seven points. Both contestants score in this case if their results are identical or equally close to the target on either side.

## The rounds with questions involving letters:
- In this round, one contestant is asked how many vowels they would like to be used in a selection of 10 randomly generated letters, each chosen unseen from all possible vowels or consonants. The same letter may appear more than once. The game originally used seven letters, increasing with time to eight and then nine; the 10-letter rule was instituted on 4 April 2010. Contestants previously selected letters by calling for one vowel or consonant at a time.
- Once the letters are selected, the contestants are given 30 seconds to form the longest word possible, using each letter no more times than it appears. The contestant who forms the longer valid word scores one point per letter used; if both contestants find the same word or words of equal length, each one scores. Diacritics are not shown on the letters, but may be added as needed: for instance, the Spanish word caminar (to walk) can be formed with the tiles C A M I N A R.
- Only single words are admitted. No spaces, no hyphens.
- Minimum word length is of 4 words.

## The duel
- After these 6 rounds switching between numbers and letters (there's 3 rounds for numbers and 3 rounds for letters), the contestants will have an additional round called the "duels".
- In this section there're several challenges:
  - The classic version: given a selection of 10 letters, use each of them once and only once to form two words fitting a common theme
  - "One within the other": with ten given letters, find a ten-letter word and another word, within the first; one a proper noun, the other a common noun
  - "Correct spelling": be the first to spell a given word correctly
  - "Mental arithmetic": be the first to complete a sequence of calculations in one's head (e.g. (((((889 - 662) + 697) / 7) * 6) / 4); answer = 198).
- Only one answer is accepted, from the first player to buzz-in. If the answer is correct, ten points (originally five points) are awarded to the player giving it. If the answer is incorrect, the opponent receives three points.

## The endgame
- Only the winning contestant plays this round, and they have three minutes to find the longest word possible in eight different 12-letter selections. Those 10-letter selections are scrambled and contain the word, as well as some other random letters that are not part of the word. We can have words that contain 7, 8, 9 or 10 of the letters. All the words are related to a topic, for example "Astronomical terms". Valid words for this topic would be: "PLANETS", "ASTEROID", "SINGULARIY", etc.
- The difficulty distribution of these words should be a 30% of "easy", common used words, 40% "moderate", less utilized words, and a 33% of "difficult / very difficult" or uncommon words.
- The contestant will receive 100 power points per correct answer given. These points are no longer the normal score of the previous rounds, but a new score round starting from zero (these 'points' will be converted into real money the contestants can earn). The length of the longest word is given for each selection. The contestant may pass as often as desired, and the selections are cycled until the time expires or all eight have been solved.

# What we want to build

## The game engine

- Implement this game, using web technologies, that's using HTML, CSS and JS. I'd like to create a backend with all the game rules, and the backend engine could be in Python, or whatever you consider it will be more robust. The frontend can be done in HTML and CSS. The first version doesn't need to have fancy or eye-catching styling or graphics, but I'd like to have the frontend  designed in a way that we can make it prettier in a future.

### The game language and datasources
- Because we're doing the *spanish* version of the game, all the existing words *must* be present in the _Diccionario de la Real Academia Española de la Lengua_ (DRAE).
- We already have this dictionary with all the valid words, which originally is set on the file `data/diccionario_es.txt`.
- This is a 1MB text file with a lot of entries. If this would be more performant by using SQLite, then we can create a mini database to hold the words.
- If a word contains accents or other diacritical marks, such as an umlaut, the contestant must enter the letters with the correct accents. The word will be considered correct if it is spelled correctly. Otherwise, the word will not be counted as correct.
- This dictonary can have cases in which the word contains a "comma", for example: "cinemático, ca". This means that the word can have more than one "genre" (masculine, femenine), so in this case "cinemáti*co*" and "cinemáti*ca*" would be both *valid* words.
- Verb conjugaction is also, however, we're not convering this yet. Spanish conjugations are a bit tricky and that would need a separate engine for itself and build some logic to check the conjugations (this would be quite complex to do in the first iteration), as well as distinguish and knowing which words are 'verbs' and which ones are not.

### Other technical aspects
- Separate concerns, and go step by step. First, implement the game engine itself (with a subengine for the numbers, and other for the letters). In the first iterations I prefer functionality over quality of presentation.
- Because making it multiplayer from the beginning could be very challenging, I'd like to implement first the "solo mode". That is playing solo (without any other contestant).
- In this "solo mode" you'll be able to play as many times as you want in the "letters" rounds or the "cyphers" rounds, as well as the endgame.
- When the time runs out in each "letter" challenge, if there's any other longer word that can be made, it's nice to show other possibilities.
- When the time runs out in each "number" challenge, if none of the contestants could get the exact number, and there's a way to  get the exact number, operations to reach it should be shown. If there's no way to get the exact number, then the contestant should be noticed that there was no chance to get that exact number. In this case, the player that has the best approximation, gets the points.
- Let's not reinvent the wheel. If some features are simple to calculate, let's create the logic manually. However, it's preferrable to use known algorithms and libraries other than creating them by ourselves.
- Unit tests should be created for the game engine. Each individual engine should have its own unit tests. This way we can add more features as well as improving the performance without breaking the functionality. Also, we can make further automations easily whenever necessary.
- However, I'd like to think in advance and add the necessary elements (or the boilerplate) to make this game multiplayer in the future, so we don't have to rewrite it entirely. The engine should be unique, nonetheless.
- The game will be packed in a docker image for further distribution and deployment, unless you got better recomendations.
- During the development, write a document of each step done, so we can keep track of what  we've done so far in case we need to review or rollback. This document doesn't need to be super detailed, think about more of a checklist, or a plan with milestones.

### Additional permissions
- If anything is unclear, before making a wrong assumption, is perfectly fine to prompt a question. All the clarifications will be added to our documentation.
- You're allowed to do additional research by using your search tools.

## Additional sources:
- [Des Chiffres et des Lettres (Wikipedia)](https://en.wikipedia.org/wiki/Des_chiffres_et_des_lettres)
- [Countdown (game show, Wikipedia)](https://en.wikipedia.org/wiki/Countdown_(game_show))
- [Cifras y Letras (Wikpedia)](https://es.wikipedia.org/wiki/Cifras_y_letras)