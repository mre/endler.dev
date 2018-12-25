+++
title="The Unreasonable Effectiveness of Excel Macros"
date=2018-11-05
path="2018/excel"
+++


I never was a big fan of internships, partially because all the exciting
companies were far away from my little village in Bavaria and partially because
I was too shy to apply.

Only once I applied for an internship in Ireland as part of a school program.
Our teacher assigned the jobs and so my friend got one at Apple and I ended up
at a medium-sized IT distributor &mdash; let's call them PcGo.

<!-- more -->

Judging by the website, the company looked quite impressive, but in reality, it
was just a secluded, grey warehouse in the rainy industrial area of Cork. Upon
arrival, I was introduced to my colleague Evgeny, who was the main (and only)
employee responsible for assembling desktop computers. From what I can tell, he
ran the shop. He just spoke broken English, so he handed me an electric
screwdriver and a box of screws, and I got to work. Together we assembled a lot
of computers in my first week, and we had a lot of fun. One day he drove me home
from work because I missed my bus. It was a rainy day and while he was driving
through the narrow streets of Cork we talked and laughed, but all of a sudden I
heard a loud bang. I looked through the rear mirror only to find that there was
no rear mirror anymore. Turns out he bumped into another car, and the thing went
off. Evgeny didn't mind. In a thick Eastern-European accent he remarked "Lost
three mirrors before already," and kept driving.

In my second week, I had a visit from my boss. Apparently, I was done with the
workload that they planned for my three-week internship. I was used to
assembling and installing computers, which explains why.

To keep me busy, they put together another task. On an old Windows 98 computer
in the back, he pointed the browser to silverpages.ie, searched for "computer"
and after a while we looked at an endless list of addresses of Irish companies
having "something to do with computers." Each entry consisted of the expected
fields: the company name, the address, the phone number, the website (if any)
and a list of keywords.

My boss said that they needed an overview of all competing vendors. He carefully
selected a field from an entry, copied it and pasted it into an Excel sheet. He
did the same for the remaining fields. "That's it!", he said with a fake smile.
We both knew that this would mean two boring weeks for me.

*They wanted to keep me busy by letting me manually scrape the entirety of a web database.*

I could have taken that as an insult, but instead, I looked at it as a
challenge.

I noticed that the page number on silverpages.ie could be controlled by a `GET`
parameter.

"Can I write a program that does the scraping?" My boss was noticeably puzzled.
"Uhm... you can do whatever you want, but you're not allowed to install any
additional software!". With that, he was off.

Judging from the installed programs, I wasn't left with many choices: Excel or
Minesweeper. I knew that Excel's Visual Basic macros were quite powerful, but I
wasn't sure if I could scrape a full website with it.

After a while, I detected a feature to download a website into an Excel sheet
(what a glorious functionality). This worked perfectly, so all I had to do was
record a macro to create a temporary sheet for each page, copy all important
fields into a "master slide" and then get rid of the temporary sheet. I recorded
the macro and looked at the code. The rest of the day was spent figuring out how
to modify the URL in a loop and cleaning up the macro. I pressed the "run macro"
button and then I sat there waiting. The computer was running at full speed. My
biggest fear was that the program would crash or that the computer would run out
of memory. I refrained from playing minesweeper on it, so I mostly played pool
or chatted with Evgeny.

When I came to the office the next morning, my program was done. To my surprise, it scraped the entirety
of SilverPages, and there were many thousands of entries in the list. I sent the
document to my boss via E-Mail and then got back to playing minesweeper.

An hour later, three guys with suits were standing behind me. I had to show them
the list again. They couldn't believe I did that on my own, so I showed them the
tool to scrape the data. For them, I had some sort of superpower.

They left without giving me another task; I was free to do whatever I wanted for
the remaining two weeks. I went on to write an inventory tool for them, which
they could also manage via Excel. It was just a glorious Excel form for a
spreadsheet that they maintained manually. I spent two weeks of my summer
vacation to finish that tool because they said they would pay me for that, which, of course, they didn't :).

## Lessons learned

* Never underestimate the power of Excel macros.
* If you have a boring task at hand, make it a challenge for yourself by adding
  a handicap.
