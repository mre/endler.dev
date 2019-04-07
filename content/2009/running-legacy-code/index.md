+++
title="Running Legacy Code"
date=2009-11-08
+++


This short article deals with a severe problem in software development: bit rot.
When switching to a new platform (for instance from Windows XP to Windows Vista/7), the programmers need to make sure that old bits of code run flawlessly. There are several ways to achieve this goal that will be discussed in the next paragraphs:


## Porting the code
This is generally considered a hard path to follow. For non-trivial legacy code-blocks, chances are high that they contain side-effects and hacks to make them work in different environments. Porting code means replacing parts of the program that use functions and methods that don't exist anymore with new ones which make use of the modern libraries&nbsp; and routines of the new platform. The significant advantages are maintainable software and sometimes faster running programs. But it may be needed to hack the new platform libraries in order to preserve the whole functionality of an old application. When changing an algorithm inside legacy code, the ported version may become unstable. Thus there may be better ways of maintaining obsolete code today.

## Emulators

Emulators work much the same like porting the code. You replace old function calls with new ones to make everything work again. <br />However you don't alter the old codebase itself (because you may not have the source code available) but you create a new compatibility layer that "translates" the communication between the underlying operating system and software (our new platform) and our old software. Emulation can also be very fast and run stable for many years but writing an emulator can be even harder than porting the code because an educational guess may be needed to figure out how the program works internally. Additionally, the emulator itself may become obsolete in the future and might eventually&nbsp; be replaced by a new one.


## Virtual machines
During the last years, a new approach was gaining popularity. The idea is simple: Don't touch anything. Take the whole platform and copy it in order to run old software. The old software runs on top of the old operating system within a virtual machine that runs on the new platform. 

From a sane software developers view, this method is ridiculous. A lot of resources are wasted along the way. The system is busier switching contexts from an old platform to the new one and back than running the actual legacy program. However, with cheap and capable hardware everywhere this idea gets more and more interesting. As [Steve Atwood coined it](http://www.codinghorror.com/blog/archives/001198.html):  

>    Always try to spend your way out of a performance problem first by throwing faster hardware at it.

And he's right. The Microsoft developers did the same on their new NT 6.0 platform (Vista, Windows 7, Windows Server 2008...): Windows XP is running on a virtual machine. This way everything behaves just like one would run the software on the old system. And by optimizing the performance bottlenecks (input/output, context switches), one gets a fast and stable, easy to maintain product.

Every method has its major advantages and disadvantages. It's on the developer to select the appropriate strategy.



