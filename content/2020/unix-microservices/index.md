+++
title="No, microservices are not embracing the Unix philosophy"
date=2019-04-01
draft=true
+++


Recruiter emails:
Many of microservices in production.

> We believe in the Unix philosophy of small composable modular architecture, which we automate full stack tests against. Every single piece of the platform is managed using infrastructure as a code.

I'm sorry, but that's not what the Unix philosophy means.

Network calls
Glue code between the services: request handling, logging

You're not building small, composable tools, you're building a distributed system!


I'm pretty sure when Thompson, Ritchie, and McIllroy established the Unix Philosphoy, they didn't have microservices in mind.
From running many microservices in production, they can be very fragile.

Avoid State
Avoid network calls

It's true, microservices are easy to write. The hard part is operations.
This is where they differ from Unix tools.

Unix tools: `cat`, `ls`, `rm`.
Microservices: Account managemer, cache, geoip service, kiosk service.
A lot more moving parts. A lot more things that can go wrong.
Other systems instead lump these into a single "account management" service with an internal structure and command language of its own.

Simplicity goes out the window when you have state.
`cat` does not have any state; neither does `ls`.
In-flight transactions make deployments harder.

Expect the output of every program to become the input to another, as yet unknown, program. Don't clutter output with extraneous information. Avoid stringently columnar or binary input formats. Don't insist on interactive input.




We used to sit around in the Unix Room saying, 'What can we throw out? Why is there this option?' It's often because there is some deficiency in the basic design — you didn't really hit the right design point. Instead of adding an option, think about what was forcing you to add that option.


Make every program a filter according to Mike Gancarz. 


What actually happens is that a lot of people take the Unix Philosophy as a success story and they would like to frame their own architecture in the same way.
Not everything should be a microservice and for the ones that are we need different paradigms.

So stop saying that you're embracing the Unix Philosophy if you run microservices in production.

