+++
title="Hacker Folklore"
date=2020-04-24
draft=false

[extra]
subtitle="Because \"Computer Etymology\" sounded boring."
credits = [
  {name = "Simon Brüggen", url="https://github.com/m3t0r" },
  {name = "Jakub Sacha", url="https://github.com/jakubsacha" },
]
comments = [
  {name = "lobste.rs", url="https://lobste.rs/s/7yhwfu/hacker_folklore"}
]
+++

Some computer terms have a surprising legacy. Many of them are derived from
long-obsolete technologies. This post tries to dust off the exciting history of
some
of these terms that we use every day but aren't quite sure about their origins.

Most of the content comes from sources like Wikipedia (with reference where
appropriate), but the explanations are hard to hunt down if you don't know what
you're looking for.  
This is a living document, and I'm planning to update it in case of reader
submissions.

## Bike-Shedding

_Today's meaning: A pointless discussion about trivial issues._

The term bike-shed effect or bike-shedding was coined as a metaphor to
illuminate the law of triviality; it was popularised in the Berkeley Software
Distribution community by the Danish computer developer [Poul-Henning Kamp in
1999 on the FreeBSD mailing list](http://phk.freebsd.dk/sagas/bikeshed/) and has
spread from there to the whole software industry.

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

{{ figure(src="bending-roll.jpg",caption="An old machine that bended steel
plates to water boilers.", credits="[Wikimedia
Commons](https://commons.wikimedia.org/wiki/File:Modern_mechanism,_exhibiting_the_latest_progress_in_machines,_motors,_and_the_transmission_of_power,_being_a_supplementary_volume_to_Appletons'_cyclopaedia_of_applied_mechanics_(1892)_(14583761620).webp)")
}}

_Today's meaning: A chunk of code that is copied over and over again with little
or no changes made to it in the process._

_Boiler plate_ originally referred to the rolled steel used to make water
boilers but is used in the media to refer to hackneyed or unoriginal writing.
The term refers to the metal printing plates of pre-prepared text such as
advertisements or syndicated columns that were distributed to small, local
newspapers. These printing plates came to be known as 'boilerplates' by analogy.
One large supplier to newspapers of this kind of boilerplate was the Western
Newspaper Union, which supplied "ready-to-print stories [which] contained
national or international news" to papers with smaller geographic footprints,
which could include advertisements pre-printed next to the conventional content.

References:

- [Wikipedia](https://en.wikipedia.org/wiki/Boilerplate_text)
- [Stack Overflow](https://stackoverflow.com/a/3997441/270334)
- [StackExchange - English Language &
  Usage](https://english.stackexchange.com/questions/464924/boilerplate-versus-template/464929)

{{ figure(src="boilerplate.jpg", caption="The man in the foreground is holding
a rounded printing plate. Plates like this were provided by companies such as
Western Newspaper Union to many smaller newspapers.", credits="[Wikimedia
Commons](https://english.stackexchange.com/a/464929)") }}

## Bug

_Today's meaning: A defect in a piece of code or hardware._

The origins are unknown!
Contrary to popular belief it _predates the bug
found by Grace Hopper in the Mark II computer_.

The term was used by engineers way before that; at least since the 1870s.
It predates electronic computers and computer software.
Thomas Edison used the term "bug" in his notes.
[Reference](https://en.wikipedia.org/wiki/Software_bug#Etymology)

## Carriage Return and Line Feed

_Today's meaning: Set the cursor to the beginning of the next line._

These two terms were adopted from typewriters.

The carriage holds the paper and is moving from left to right to advance the
typing position as the keys are pressed. It "carries" the paper with it. The
carriage return is the operation when the carriage gets moved into its original
position on the very left end side of the paper.

Simply returning the carriage to the left is not enough to start with a new
line, however. The carriage would still be on the same line than before &mdash;
just at the beginning of the line. To go to a new line, a _line feed_ was
needed. It would move the paper inside the typewriter up by one line.

These two operations &mdash; carriage return (CR) and line feed (LF) &mdash;
were commonly done at once by pushing the carriage return lever.

{{ figure(src="typewriter-top.jpg", caption="A mechanical typewriter. The lever for the carriage return is
on the outer left side.", credits="Source:
[piqsels](https://www.piqsels.com/da/public-domain-photo-spbhs)") }}

- On Unix systems (like Linux or macOS), a `\n` still stands for a  
  _line feed_ (ASCII symbol: LF) or _newline_.
- On CP/M, DOS, and Windows, `\r\n` is used, where `\r` stands for
  _carriage return_ and `\n` stands for line feed (CR+LF).
- [Reference](https://en.wikipedia.org/wiki/Newline)

Here is an old video that shows the basic mechanics of carriage return and
line-feed:

{{ video(id="EWfElq1vgLA", start="842", preview="typewriter.jpg") }}

## Command key symbol (⌘)

_Today's meaning: A meta-key available on Apple computers to provide additional
keyboard combinations._

Directly quoting Wikipedia (emphasis mine):

The ⌘ symbol came into the Macintosh project at a late stage. The development
team originally went for their old Apple key, but Steve Jobs found it
frustrating when "apples" filled up the Mac's menus next to the key commands,
because he felt that this was an over-use of the company logo. He then opted for
a different key symbol. With only a few days left before deadline, the team's
bitmap artist Susan Kare started researching for the Apple logo's successor. She
was browsing through a symbol dictionary when she came across the
cloverleaf-like symbol, commonly used in Nordic countries as an indicator of
cultural locations and **places of interest** (it is the official road sign for
tourist attraction in Denmark, Finland, Iceland, Norway, and Sweden and the
computer key has often been called Fornminne — ancient monument — by Swedish Mac
users and Seværdighedstegn by Danish users). When she showed it to the rest of
the team, everyone liked it, and so it became the symbol of the 1984 Macintosh
command key. Susan Kare states that it has since been told to her that the
symbol had been picked for its Scandinavian usage due to its resembling the
shape of a square castle with round corner towers as seen from above looking
down, notably Borgholm Castle.

{{ figure(src="severdighet.jpg", caption="Norwegian Severdighet road sign",
credits="[Wikimedia
Commons](https://commons.wikimedia.org/wiki/File:Severdighet.svg)") }}

{{ figure(src="borgholm.jpg", caption="Aearial view of Borgholm Castle, which could have been the model for the symbol ",
credits="[Wikimedia
Commons](https://commons.wikimedia.org/wiki/File:Borgholms_slottsruin_fr%C3%A5n_luften.webp)") }}

References:

- [Wikipedia: Command Key](https://en.wikipedia.org/wiki/Command_key)
- [Cult of Mac: What Are The Mac’s Command ⌘ And Option ⌥ Symbols Supposed To
  Represent?](https://www.cultofmac.com/181495/what-are-the-macs-command-%E2%8C%98-and-option-%E2%8C%A5-symbols-supposed-to-represent/)

## Core Dump

_Today's meaning: Retrieving a snapshot of a (crashed) program's state by
storing all of its memory for offline analysis._

The name comes from [magnetic core
memory](https://en.wikipedia.org/wiki/Magnetic-core_memory), which is an early
storage mechanism based on a grid of toroid magnets. It has since become
obsolete, but the term is still used today for getting a snapshot of a computer
process. [Reference](https://en.wikipedia.org/wiki/Core_dump)

{{ figure(src="corememory.jpg",caption="A 32 x 32 core memory plane storing
1024 bits (or 128 bytes) of data. The first core dumps were printed on paper, which sounds reasonable given these small amounts of bytes.", credits="[Wikimedia
Commons](https://de.wikipedia.org/wiki/Datei:KL_CoreMemory.webp)") }}

## Cursor

_Today's meaning: a visual cue (such as a flashing vertical line) on a video display that indicates position (as for data entry). [Merriam-Webster](https://www.merriam-webster.com/dictionary/cursor)_

_Cursor_ is Latin for _runner_. A cursor is the name given to the transparent
slide engraved with a hairline that is used for marking a point on a slide rule.
The term was then transferred to computers through analogy.
[Reference](<https://en.wikipedia.org/wiki/Cursor_(user_interface)>)

{{ figure(src="slide-rule.jpg", credits="A December 1951 advertisement for the
IBM 604 Electronic Calculating Punch that was first produced in 1948. The
advertisement claims the IBM 604 can do the work of 150 engineers with slide
rules. The cursor (or runner) is the transparent part in the middle of the
slide.") }}

## Dashboard

_Today's meaning: A user interface that provides a quick overview of a system's
status._

Originally a plank of wood at the front of a horse-drawn carriage to protect the
driver from mud 'dashed' backward by a horses hooves.

When automobiles were manufactured, the board in front of the driver was given
the same name. That was the logical place to put the necessary gauges so the
driver could see them easily. In time, the term became more associated with the
readouts than the protection it offered.
[Reference](https://www.quora.com/What-common-phrases-are-derived-from-obsolete-technologies/answer/Geoffrey-Widdison)

{{ figure(src="dashboard.jpg",caption="A dashboard of a horse carriage.",
credits="[Wikimedia
Commons](https://commons.wikimedia.org/wiki/File:Dashboard_(PSF).webp)") }}

## Firewall

_Today's meaning: A network security system that establishes a barrier between a trusted internal network and an untrusted external network, such as the Internet._

Fire walls are used mainly in terraced houses, but also in individual residential buildings. They prevent fire and smoke from spreading to another part of the building in the event of a fire. Large fires can thus be prevented. The term is used in computing since the 80s.
[Reference](<https://en.wikipedia.org/wiki/Firewall_(computing)#History>)

{{ figure(src="firewall.jpg",caption="Firewall residential construction, separating the building into two separate residential units, and fire areas.", credits="[Wikimedia
Commons](https://commons.wikimedia.org/wiki/File:Brandwand_2.webp)")
}}

## Firmware

_Today's meaning: A class of computer software that provides the low-level
control for the device's specific hardware and closely tied to the hardware it runs on._

[Ascher
Opler](https://archive.org/details/TNM_4th_generation_software_hardware_-_Datamation_20171010_0125/mode/2up)
coined the term _firmware_ in a 1967 Datamation article. As originally used,
firmware contrasted with hardware (the CPU itself) and software (normal
instructions executing on a CPU). It existed on the boundary between hardware
and software; thus the name "firmware". The original article is available on the
[Internet
Archive](https://archive.org/details/TNM_4th_generation_software_hardware_-_Datamation_20171010_0125/mode/2up).
[Reference](https://en.wikipedia.org/wiki/Firmware)

## Foo and Bar

_Today's meaning: Common placeholder variable names._

Originally the term might come from the military term _FUBAR_.
There are a few variations, but a common meaning is [FUBAR: "f\*\*\*ed up beyond all recognition"](https://en.wikipedia.org/wiki/List_of_military_slang_terms#FUBAR).

The use of `foo` in a programming context is generally credited to the Tech
Model Railroad Club (TMRC) of MIT from circa 1960. In the complex model system,
there were scram switches located at numerous places around the room that could
be thrown if something undesirable was about to occur, such as a train going
full-bore at an obstruction.

The way I understood it was that they literally had emergency buttons labeled
`foo` for lack of a better name.
Maybe related to the original military meaning of FUBAR to indicate that something is going very very wrong.

{{ figure(src="scram.jpg",caption="A scram switch (button), that could be
pressed to prevent inadvertent operation. Maybe the TMRC had buttons labeled `foo` instead", credits="Source [Wikimedia
Commons](https://commons.wikimedia.org/wiki/File:EBR-I_-_SCRAM_button.webp)" ) }}

References:

- [Wikipedia](https://en.wikipedia.org/wiki/Foobar#History_and_etymology)
- [Stack Overflow](https://stackoverflow.com/a/6727104/270334).

## Freelancer

_Today's meaning: A self-employed person, which is not committed to a particular employer long-term._

The term first appears in the novel [Ivanhoe](https://en.wikipedia.org/wiki/Ivanhoe) by Sir Walter Scott. (The novel also had a [lasting influence](https://en.wikipedia.org/wiki/Ivanhoe#Lasting_influence_on_the_Robin_Hood_legend) on the Robin Hood legend.)

{{ figure(src="ivanhoe.jpg",caption="Cover of a Classic Comics book", credits="[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:CC_No_02_Ivanhoe_2.jpg)" ) }}

In it, a Lord offers his paid army of 'free lances' to King Richard:

> I offered Richard the service of my Free Lances, and he refused them
> &mdash; I will lead them to Hull, seize on shipping, and embark for Flanders;
> thanks to the bustling times, a man of action will always find employment.

Therefore, a "free lancer" is someone who fights for whoever pays the most.
Free does not mean "without pay", but refers to the additional freedom to work for any employer. [Reference](https://www.merriam-webster.com/words-at-play/freelance-origin-meaning)

## Log / Logfile

_Today's meaning: A file that records events of a computer program or system._

Sailors used so-called log lines to measure the speed of their ship. A flat
piece of wood (the log) was attached to a long rope. The log had regularly
spaced knots in it. As the log would drift away, the sailors would count the
number of knots that went out in a fixed time interval, and this would be the
ship's speed &mdash; in knots.

The ship's speed was important for navigation, so the sailors noted it down in a book, aptly called the _log book_, together with other information to establish the position of the ship more accurately, like landmark sightings and weather events. Later, additional information, more generally concerning the ship, was added &mdash; or logged &mdash; such as harbor fees and abnormal provision depletion.

[Reference](https://www.usna.edu/Users/oceano/pguth/website/shipwrecks/logbooks_lesson/logbooks_lesson.htm).

{{ figure(src="log-seamen.jpg",caption="Sailors measuring ship speed with a
log line", credits="[The Pilgrims & Plymouth Colony:1620 by Duane A.
Cline](https://sites.rootsweb.com/~mosmd/logln.htm)" ) }}

{{ figure(src="log-line.jpg",caption="The parts of a log-line", credits="[The
Pilgrims & Plymouth Colony:1620 by Duane A.
Cline](https://sites.rootsweb.com/~mosmd/logln.htm)" ) }}

{{ figure(src="logfile.jpg",caption="Page from the log-file of the British
Winchelsea. The second column denotes the number of knots measured with the
log-line, which indicates the ship's speed", credits="[Navigation and Logbooks
in the Age of Sail by Peter
Reaveley](https://www.usna.edu/Users/oceano/pguth/website/shipwrecks/logbooks_lesson/logbooks_lesson.htm)")
}}

## Patch

_Today's meaning: A piece of code that can be applied to fix or improve a
computer program._

In the early days of computing history, if you made a programming mistake, you'd
have to fix a paper tape or a punched card by putting a patch on top of a hole.

{{ figure(src="patch.jpg",caption="A program tape with physical patches used
to correct punched holes by covering them.", credits="[Smithsonian Archives
Center](https://americanhistory.si.edu/archives)") }}

## Ping

_Today's meaning: A way to check the availability and response time of a computer over the network._

Ping is a terminal program originally written by Mike Muuss in 1983 that is included in
every version of UNIX, Windows, and macOS. He named it "after the sound that a
sonar makes, inspired by the whole principle of echo-location. [...] ping uses
timed `IP/ICMP ECHO_REQUEST` and `ECHO_REPLY` packets to probe the "distance" to the
target machine." The [reference](https://ftp.arl.army.mil/~mike/ping.html) is
well worth a read.

## Pixel

_Today's meaning: The smallest controllable element of a picture represented on the screen._

The word pixel is a combination of _pix_ (from "pictures", shortened to "pics") and _el_ (for "element").
Similarly, _voxel_ is a volume element and _texel_ is a texture element.
[Reference](https://en.wikipedia.org/wiki/Pixel)

## Shell

_Today's meaning: An interactive, commonly text-based runtime to interact with a
computer system._

The inventor of the term, Louis Pouzin, does not give an explanation for the
name in his essay [The Origins of the
Shell](https://www.multicians.org/shell.html). It can however be traced back to
Unix' predecessor Multics. It is described in the [Multics
glossary](https://www.multicians.org/mgs.html) like so:

> [The shell] is passed a command line for execution by the **listener**.

The _The New Hacker's Dictionary_, (also known as the _Jargon File_) by [Eric S.
Raymond](http://www.catb.org/~esr/) contains [the
following](http://www.catb.org/jargon/html/S/shell.html):

> Historical note: Apparently, the original Multics shell (sense 1) was so
> called because it was a shell (sense 3);

where sense 3 refers to

> A skeleton program, created by hand or by another program (like, say, a parser
> generator), which provides the necessary incantations to set up some task and
> the control flow to drive it (the term driver is sometimes used synonymously).
> The user is meant to fill in whatever code is needed to get real work done.
> This usage is common in the AI and Microsoft Windows worlds, and confuses Unix
> hackers.

Unfortunately, the book does not provide any evidence to back up this claim.

I like the (possibly historically incorrect) analogy to a nut with the shell
being on the outside, protecting the kernel.

[Reference](https://unix.stackexchange.com/questions/14934/why-was-the-word-shell-used-to-descibe-a-command-line-interface)

## Slab allocator

_Today's meaning: An efficient memory allocation technique, which reuses
previous allocations._

Slab allocation was invented by [John
Bonwick](https://www.usenix.org/publications/library/proceedings/bos94/full_papers/bonwick.ps)
(Note: PDF file) in 1994 and has since been used by services like
[Memcached](https://www.memcached.org/) and the Linux Kernel.

> With slab allocation, a cache for a certain type or size of data object has a
> number of pre-allocated "slabs" of memory; within each slab there are memory
> chunks of fixed size suitable for the objects.
> ([Wikpedia](https://en.wikipedia.org/wiki/Slab_allocation#Basis))

The name _slab_ comes from a teenage friend of Bonwick. He [tells the
story](https://blogs.oracle.com/bonwick/now-it-can-be-told) on the Oracle blog:

While watching TV together, a commercial by Kellogg's came on with the tag line,
"Can you pinch an inch?"

> The implication was that you were overweight if you could pinch more than an
> inch of fat on your waist -- and that hoovering a bowl of corn flakes would
> help.

> Without missing a beat, Tommy, who weighed about 250 pounds, reached for his
> midsection and offered his response: "Hell, I can grab a slab!"

A decade later, Bonwick remembered that term when he was looking for a word to
describe the allocation of a larger chunk of memory.

Here is the original Kellogg's advertisement:

{{ video(id="A8zYYg8wfmM", preview="kellogs.jpg") }}

## Spam

_Today's meaning: Unsolicited electronic communications, for example by sending
mass-emails or posting in forums and chats._

The term goes back to a sketch by the British comedy group Monty Python from 1970.
In the sketch, a cafe is including
[Spam](<https://en.wikipedia.org/wiki/Spam_(food)>) (a brand of canned cooked
pork) in almost every dish. The excessive amount of Spam mentioned is a
reference to the ubiquity of it and other imported canned meat products in the
UK after World War II (a period of rationing in the UK) as the country struggled
to rebuild its agricultural base.
[Reference](https://en.wikipedia.org/wiki/Spamming#Etymology)

{{ figure(src="spam.jpg", caption="Vintage Ad: Look What You Can Do With One
Can of Spam ", credits="By user [Jamie (jbcurio) on
flickr.com](https://www.flickr.com/photos/jbcurio/3878241798)") }}

<iframe  title="Monty Pythons Flying Circus (1974) - SPAM sketch" src="https://player.vimeo.com/video/329001211" width="640" height="480" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

[Monty Pythons Flying Circus (1974) - SPAM](https://vimeo.com/329001211) from
[Testing Tester](https://vimeo.com/user97138516) on [Vimeo](https://vimeo.com).

## Radio Button

_Today's meaning: A UI element that allows to choose from a predefined set of
mutually exclusive options_

"Radio buttons" are named after the analogous pendant of mechanical buttons that
were used in radios. The UI concept has later been used in tape recorders,
cassette recorders and wearable audio players (the famous "Walkman" and
similar). And later in VCRs and video cameras.
[Reference](https://www.jitbit.com/radio-button/)

{{ figure(src="radio-buttons.jpg",caption="An old car radio (left) and CSS
radio buttons (right). Only a single option can be selected at any point in
time. As a kid, I would push two buttons at once so they would interlock. Good
times.", credits="Images by [Matt Coady](https://twitter.com/themattcoady)") }}

## Uppercase and lowercase

_Today's meaning: Distinction between capital letters and small letters on a
keyboard._

Back when typesetting was a manual process where single letters made of led were
"type set" to form words and sentences, upper- and lowercase letters were kept
in separate containers &mdash; or cases &mdash; to make this rather tedious process a little faster.

{{ figure(src="printers_cases.jpg",caption="A set of printers cases",
credits="From the book 'Printing types, their history, forms, and use; a study in
survivals' by Updike, Daniel Berkeley, 1860-1941. [Freely available on
archive.org](https://archive.org/details/printingtypesthe01updi/).") }}

## Honorable mentions

### 404

_Today's meaning: HTTP Status Code for "File not found"._

There is a story that the number comes from the server room where the World Wide
Web's central database was located. In there, administrators would manually
locate the requested files and transfer them, over the network, to the person
who made that request. If a file didn't exist, they'd return an error message:
"Room 404: file not found".

This, however, seems to be a myth and the status code was chosen rather
arbitrarily based on the then well-established FTP status codes.
[Reference](https://knowyourmeme.com/memes/404)

## Programming languages and Abbreviations

The etymology of programming language names and common abbreviations would
probably warrant its own article, but I've decided to note down some of my
favorites for the time being.

### C++

C++ is a programming language based on C by Bjarne Stroustrup. The name is a
programmer pun by Rick Mascitti, a coworker of Stroustrup. The `++` refers to
the post-increment operator, that is common in many C-like languages. It
increases the value of a variable by 1. In that sense, C++ can be seen as the
spiritual "successor" of C.
[Reference](https://en.wikipedia.org/wiki/C%2B%2B#History)

### C Sharp

Similarly to C++, C# is a C-like programming language. The name again refers to
"incremental" improvements on top of C++. The `#` in the name looks like four
plus signs. Hence `C# == (C++)++`. But on top of that, the name was also
inspired by the musical notation where a sharp indicates that the written note
should be made a semitone higher in pitch.
[Reference](<https://en.wikipedia.org/wiki/C_Sharp_(programming_language)#Name>)

{{ figure(src="csharp.svg", caption="A C-Sharp note.", credits="[Wikimedia
Commons](https://commons.wikimedia.org/wiki/File:Treblecsharp5.svg)") }}

### PNG

Officially, PNG stands for _Portable Network Graphics_. It was born out of
frustration over a CompuServe announcement in 1994 that programs supporting GIF
would have to pay licensing fees from now on. A working group lead by hacker
[Thomas Boutell](https://boutell.dev/) created the `.webp` file format, a
patent-free replacement for GIF. Therefore I prefer the format's unofficial
name: _PNG's Not GIF_. Here's a [great
article](https://people.apache.org/~jim/NewArchitect/webrevu/1997/05_09/designers/05_09_97_1.html)
on PNG's history.
[Reference](https://encyclopedia2.thefreedictionary.com/PNG%27s+Not+GIF)

## Conclusion

> You have to know the past to understand the present.  
> &mdash; Dr. Carl Sagan (1980)

I hope you enjoyed this trip down memory lane. Now it's your turn!  
👉 Do you know any other stories? Send me a message, and I'll add them here.

## Related Projects

- [Awesome Computer History](https://github.com/watson/awesome-computer-history):
  A curated list of computer history videos, documentaries and related folklore
  maintained by Thomas Watson.
- [Wikipedia: List of computer term etymologies](https://en.wikipedia.org/wiki/List_of_computer_term_etymologies):
  List of the origins of computer-related terms or terms used in the computing world.
- [Talk: The Etymology of Programming by Brittany Storoz - JSConf EU
  2018](https://www.youtube.com/watch?v=2KTK2qD4-gs): A talk that explains the background behind a few programming terms. Careful here: the explanation for "bug" is probably wrong as mentioned above.
- [Typewriter terminology that has survived into the personal computer
  era](https://en.wikipedia.org/wiki/Typewriter#Terminology):
  A list of computer terms that have their origins from typewriters.
- [Folklore - The Original Macintosh](https://www.folklore.org/index.py):
  Anecdotes about the development of Apple's original Macintosh, and the people who made it.
