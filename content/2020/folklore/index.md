+++
title="Hacker Folklore"
subtitle="(Because Computer Term Etymology sounds weird.)"
date=2020-04-19
draft=true
+++

This post tries to collect the surprising history of computing terms we use every day.
Most of the content comes from sources like Wikipedia (with reference where appropriate), but the explanations are hard to find if you don't know what you're searching for.

## Bikeshed

_Today's meaning: A useless discussion about trivial details_

The term bike-shed effect or bike-shedding was coined as a metaphor to
illuminate the law of triviality; it was popularised in the Berkeley Software
Distribution community by the Danish computer developer [Poul-Henning Kamp in
1999 on the FreeBSD mailing list](http://phk.freebsd.dk/sagas/bikeshed/) and has spread from there to the whole software industry.

The concept was first presented as a corollary of his broader "Parkinson's law"
spoof of management. He dramatizes this "law of triviality" with the example of
a committee's deliberations on an atomic reactor, contrasting it to
deliberations on a bicycle shed. As he put it: "The time spent on any item of
the agenda will be in inverse proportion to the sum of money involved." A
reactor is so vastly expensive and complicated that an average person cannot
understand it, so one assumes that those who work on it understand it. On the
other hand, everyone can visualize a cheap, simple bicycle shed, so planning one
can result in endless discussions because everyone involved wants to add a touch
and show personal contribution.
[Reference - Wikipedia: Law of Triviality](https://en.wikipedia.org/wiki/Law_of_triviality)

## Boilerplate

_Today's meaning: A chunk of code that is copied over and over again with little or no changes
made to it in the process._

"Boiler plate" originally referred to the rolled steel used to make water
boilers but is used in the media to refer to hackneyed or unoriginal writing.
The term refers to the metal printing plates of pre-prepared text such as
advertisements or syndicated columns that were distributed to small, local
newspapers. These printing plates came to be known as 'boilerplates' by analogy.
One large supplier to newspapers of this kind of boilerplate was the Western
Newspaper Union, which supplied "ready-to-print stories [which] contained
national or international news" to papers with smaller geographic footprints,
which could include advertisements pre-printed next to the conventional content.

{{ figure(src="./bending-roll.jpg",caption="An old machine that bended steel plates to water boilers.", credits="[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Modern_mechanism,_exhibiting_the_latest_progress_in_machines,_motors,_and_the_transmission_of_power,_being_a_supplementary_volume_to_Appletons'_cyclopaedia_of_applied_mechanics_(1892)_(14583761620).jpg)") }}

{{ figure(src="./boilerplate.jpg", caption="The man in the foreground is holding a rounded printing plate. Plates like this were provided by companies such as Western Newspaper Union.", credits="[Wikimedia Commons](https://english.stackexchange.com/a/464929)") }}

References:

- [Wikipedia](https://en.wikipedia.org/wiki/Boilerplate_text)
- [StackOverflow](https://stackoverflow.com/a/3997441/270334)
- [StackExchange - English Language & Usage](https://english.stackexchange.com/questions/464924/boilerplate-versus-template/464929)

## Bug

_Today's meaning: A defect in a piece of code or hardware_

One of the most well-known ones. Contrary to popular belief it predates the bug
found by Grace Hopper in the Mark II computer.

The term "bug" to describe defects has been a part of engineering jargon since
the 1870s and predates electronic computers and computer software; it may have
originally been used in hardware engineering to describe mechanical
malfunctions.

References

- https://en.wikipedia.org/wiki/Software_bug#Etymology

## C++

C++ is a programming language based on C by Bjarne Stroustrup. The name is a
programmer pun by Rick Mascitti, a coworker of Stroustrup. The `++` refers to
the post-increment operator, that is common in many C-like languages. It
increases the value of a variable by 1. In that sense, C++ can be seen as the
spiritual "successor" of C. [Reference](https://en.wikipedia.org/wiki/C%2B%2B#History)

## C Sharp

Similarly to C++, C# is a C-like programming language. The name again refers to
"incremental" improvements on top of C++. The `#` in the name looks like four
plus signs. Hence `C# == (C++)++`. But on top of that, the name was also
inspired by the musical notation where a sharp indicates that the written note
should be made a semitone higher in pitch.
[Reference](<https://en.wikipedia.org/wiki/C_Sharp_(programming_language)#Name>)

{{ figure(src="./csharp.svg", credits="[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Treblecsharp5.svg)") }}

## Dashboard

_Today's meaning: A user interface that provides a quick overview of a system's status._

Originally a plank of wood at the front of a horse-drawn carriage to protect the driver from mud 'dashed' backwards by a horses hooves.

When automobiles were manufactured, the board in front of the driver was given the same name. That was the logical place to put the necessary gauges so the driver could see them easily. In time, the term became more associated with the readouts than then protection it offered. [Reference](https://www.quora.com/What-common-phrases-are-derived-from-obsolete-technologies/answer/Geoffrey-Widdison)

{{ figure(src="./dashboard.png",caption="A dashboard of a horse carriage.", credits="[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dashboard_(PSF).png)") }}

## Firmware

_Today's meaning: A class of computer software that provides the low-level control for the device's specific hardware_

[Ascher Opler](https://archive.org/details/TNM_4th_generation_software_hardware_-_Datamation_20171010_0125/mode/2up) coined the term "firmware" in a 1967 Datamation article. As
originally used, firmware contrasted with hardware (the CPU itself) and software
(normal instructions executing on a CPU). It existed on the boundary between
hardware and software; thus the name "firmware". [Reference](https://en.wikipedia.org/wiki/Firmware)
The original article is available on the [Internet Archive](https://archive.org/details/TNM_4th_generation_software_hardware_-_Datamation_20171010_0125/mode/2up).

## Foo and Bar

\*\*When a programmer quickly needs a placeholder variable name, sometimes the
terms "foo" and "bar" are used.

The use of foo in a programming context is generally credited to the Tech Model Railroad Club (TMRC) of MIT from circa 1960.[1] In the complex model system, there were scram switches located at numerous places around the room that could be thrown if something undesirable was about to occur, such as a train going full-bore at an obstruction. [Reference](https://en.wikipedia.org/wiki/Foobar#History_and_etymology)

{{ figure(src="./scram.jpg",caption="A scram switch (button), that could be pressed to prevent inadvertent operation", credits="Source [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:EBR-I_-_SCRAM_button.jpg)" ) }}

A lot of additional research was done by user [Hugo on Stackoverflow](https://stackoverflow.com/a/6727104/270334):

> "Foo" and "bar" as metasyntactic variables were popularised by MIT and DEC, the first references are in work on LISP and PDP-1 and Project MAC from 1964 onwards.
> Many of these people were in MIT's Tech Model Railroad Club, where we find the first documented use of "foo" in tech circles in 1959 (and a variant in 1958).
> Both "foo" and "bar" (and even "baz") were well known in popular culture, especially from Smokey Stover and Pogo comics, which will have been read by many TMRC members.
> Also, it seems likely the military FUBAR contributed to their popularity.

In summary: it's complicated.

## Log / Logfile

{{ figure(src="./log-seamen.jpg",caption="Sailors measuring ship speed with a log line", credits="[The Pilgrims & Plymouth Colony:1620 by Duane A. Cline](http://sites.rootsweb.com/~mosmd/logln.htm)" ) }}

{{ figure(src="./log-line.jpg",caption="The parts of a log-line", credits="[The Pilgrims & Plymouth Colony:1620 by Duane A. Cline](http://sites.rootsweb.com/~mosmd/logln.htm)" ) }}

{{ figure(src="./logfile.png",caption="Page from the log-file of the British Winchelsea. The second column denotes the number of knots measured with the log-line, which indicates the ship's speed", credits="[Navigation and Logbooks in the Age of Sail by Peter Reaveley](https://www.usna.edu/Users/oceano/pguth/website/shipwrecks/logbooks_lesson/logbooks_lesson.htm)") }}

[Reference](https://www.usna.edu/Users/oceano/pguth/website/shipwrecks/logbooks_lesson/logbooks_lesson.htm).

## Patch

_Today's meaning: A piece of code that can be applied to fix or improve a computer program._

In the early days of computing history, if you made a programming mistake you'd have to fix a paper tape or a punched card by putting a patch on top of a hole.

{{ figure(src="./patch.jpg",caption="A program tape with physical patches used to correct punched holes by covering them.", credits="[Smithsonian Archives Center](https://americanhistory.si.edu/archives)") }}

## PNG

Officially, PNG stands for _Portable Network Graphics_. It was born out of
frustration over a CompuServe announcement in 1994 that programs supporting GIF
would have to pay licensing fees from now on. A working group lead by hacker
[Thomas Boutell](https://boutell.dev/) created the `.png` file format, a
patent-free replacement for GIF. Therefore I prefer the format's unofficial
name: _PNG's Not GIF_. Here's a [great article](https://people.apache.org/~jim/NewArchitect/webrevu/1997/05_09/designers/05_09_97_1.html) on PNG's history.
[Reference](https://encyclopedia2.thefreedictionary.com/PNG%27s+Not+GIF)

## Spam

The term goes back to a sketch by British comedy group Monty Python from 1970.
In the sketch, a cafe is including
[Spam](<https://en.wikipedia.org/wiki/Spam_(food)>) (a brand of canned cooked
pork) in almost every dish. The excessive amount of Spam mentioned is a
reference to the ubiquity of it and other imported canned meat products in the
UK after World War II (a period of rationing in the UK) as the country struggled
to rebuild its agricultural base. Today, the term also refers to unsolicited
electronic communications, for example by sending mass-emails or posting in
forums and chats. [Reference](https://en.wikipedia.org/wiki/Spamming#Etymology)

{{ figure(src="./spam.jpg", caption="Vintage Ad: Look What You Can Do With One Can of Spam ", credits="By user [Jamie (jbcurio) on flickr.com](https://www.flickr.com/photos/jbcurio/3878241798)") }}

[Monty Pythons Flying Circus (1974) - SPAM](https://vimeo.com/329001211) from [Testing Tester](https://vimeo.com/user97138516) on [Vimeo](https://vimeo.com):

<iframe src="https://player.vimeo.com/video/329001211" width="640" height="480" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

## i18n

Number of letters between the i and the n. Same for kubernetes (k8s) and
localization (l10n).

## Apple Command ⌘ key symbol

Directly quoting Wikipedia (emphasis mine):

The ⌘ symbol came into the Macintosh project at a late stage. The development
team originally went for their old Apple key, but Steve Jobs found it
frustrating when "apples" filled up the Mac's menus next to the key commands,
because he felt that this was an over-use of the company logo. He then opted
for a different key symbol. With only a few days left before deadline, the
team's bitmap artist Susan Kare started researching for the Apple logo's
successor. She was browsing through a symbol dictionary when she came across the
cloverleaf-like symbol, commonly used in Nordic countries as an indicator of
cultural locations and **places of interest** (it is the official road sign
for tourist attraction in Denmark, Finland, Iceland, Norway, and Sweden and
the computer key has often been called Fornminne — ancient
monument — by Swedish Mac users and Seværdighedstegn by Danish users). When
she showed it to the rest of the team, everyone liked it, and so it became the
symbol of the 1984 Macintosh command key. Susan Kare states that it has
since been told to her that the symbol had been picked for its Scandinavian
usage due to its resembling the shape of a square castle with round corner
towers as seen from above looking down, notably Borgholm Castle.

{{ figure(src="./severdighet.png", caption="Norwegian Severdighet road sign", credits="[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Severdighet.svg)") }}

References:

- [Wikipedia: Command Key](https://en.wikipedia.org/wiki/Command_key)
- [Cult of Mac: What Are The Mac’s Command ⌘ And Option ⌥ Symbols Supposed To Represent?](https://www.cultofmac.com/181495/what-are-the-macs-command-%E2%8C%98-and-option-%E2%8C%A5-symbols-supposed-to-represent/)

## Radio Button

In HTML forms, you sometimes find a set of options, that only allow a single selection.
These are called "radio buttons" after the analogous pendant of mechanical buttons
that were used in radios.
The UI concept has later been used in tape recorders, cassette recorders and wearable audio players (the famous "Walkman" and similar).
And later in VCRs and video cameras. [Reference](https://www.jitbit.com/radio-button/)

{{ figure(src="./radio-buttons.jpg",caption="An old car radio (left) and CSS radio buttons (right). Only a single option can be selected at any point in time. As a kid, I would push two buttons at once so they would interlock. Good times.", credits="Images by [Matt Coady](https://twitter.com/themattcoady)") }}

## Uppercase and lowercase

Back when typesetting was a manual process where single letters made of led were
"type set" to form words and sentences, upper- and lowercase letters were kept in separate cases to make this rather tedious process faster.

{{ figure(src="./printers_cases.png",caption="A set of printers cases", credits="
texts
Printing types, their history, forms, and use; a study in survivals by
    Updike, Daniel Berkeley, 1860-1941. [Freely available on archive.org](https://archive.org/details/printingtypesthe01updi/).") }}

# Honorable mentions

## 404

_HTTP Status Code: File not found_

There is a story that the number comes from the server room where the World Wide Web's central database was located.
In there, administrators would manually locate the requested files and transfer them, over the network, to the person who made that request.
If a file didn't exist, they'd return an error message: "Room 404: file not found".

This, however, seems to be a myth and the status code was chosen rather arbitrarily based on the then well-established FTP status codes.
[Reference](https://knowyourmeme.com/memes/404)

# Related Projects

- [Awesome Computer History](https://github.com/watson/awesome-computer-history)
- [Wikipedia: List of computer term etymologies](https://en.wikipedia.org/wiki/List_of_computer_term_etymologies)
