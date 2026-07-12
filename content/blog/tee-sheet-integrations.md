---
title: How a phone reservation should reach the tee sheet
description: Natural conversation is only the front end. Reliable booking requires one source of truth, controlled retries, and verified outcomes.
publishedAt: "2026-06-24"
---

“Can you move us from 10:20 to something around nine?” sounds simple because a person understands it immediately. A reservation system does not receive “around nine.” It receives a specific course, date, time, party, customer, rate, and action—subject to availability and policy at the moment the change is attempted.

The useful part of a phone integration is not speech-to-text. It is turning a flexible request into an exact transaction without creating a second version of the tee sheet.

## One source of truth

The tee sheet should remain authoritative for inventory and reservation state. A voice assistant may collect preferences and present options, but it should not keep a parallel calendar that can drift from what staff and online golfers see.

That principle creates a clear sequence:

1. Understand the caller's intent.
2. Collect only the required details.
3. Apply course policy and verify permission.
4. Read current state from the tee sheet.
5. Present available choices without implying a hold unless one exists.
6. Submit the exact action.
7. Confirm it to the caller only after the tee sheet reports success.
8. Record the request, response, and outcome for review.

AI can help with the conversation. Software rules and the tee-sheet vendor's actual capabilities should control the transaction.

## A timeout is not a failed booking

Distributed systems have an uncomfortable state: the booking request may succeed even when the caller-facing system never receives the response. Retrying blindly can create a duplicate reservation. Declaring failure can send the golfer elsewhere even though a booking now exists.

This is why a booking request needs a unique identity: if it must be checked or retried, the system can recognize the original action instead of creating another one. Microsoft's architecture guidance describes the underlying principle as [processing a particular operation only once](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/asynchronous-message-based-communication).

The exact recovery method depends on the tee-sheet API. If Pinbound still cannot establish the result, it should tell the caller the booking is not yet confirmed and alert the shop. Uncertainty must never become a verbal confirmation.

## Seeing a tee time is not permission to change it

Reading inventory does not change it. Booking, moving, and canceling do. A thoughtful integration treats these as separate capabilities and lets each course define which actions are allowed.

| Action | Main checks |
| --- | --- |
| Search | Course, date, party size, booking window, eligibility |
| Book | Selected inventory, customer details, rate, policy, successful vendor response |
| Look up | Booking identifier and appropriate caller verification |
| Change | Existing booking, identity, cutoff rules, replacement inventory, atomic outcome |
| Cancel | Identity, cancellation window, fees or exceptions, confirmed vendor response |

The assistant should not infer that because it can search a tee sheet, it is authorized to change it.

## Alternatives should come from live inventory

When the requested time is unavailable, a useful assistant can search a range and offer the nearest options: perhaps 8:50 on one course or 9:30 on another. Those options should come from the current sheet and include the details a golfer needs to choose, such as course, rate, walking or riding conditions, and any eligibility restriction.

Avoid overpromising during the choice. Inventory can change while the caller decides. Unless the vendor supports a real temporary hold, the language should make clear that the system still needs to submit the selection.

## Reservation changes require identity discipline

A phone number is useful for locating likely records, but caller ID is not secure identity verification. The course should define a workflow no weaker than what staff already uses—often a confirmation identifier plus matching booking details, with a stronger step when the consequence warrants it.

If identity cannot be established, transfer. Convenience does not justify exposing another golfer's reservation or canceling it.

## Keep card details off the recording

Recorded and transcribed calls are the wrong place for spoken payment credentials. The PCI Security Standards Council states that card verification codes [cannot be retained in digital audio after authorization](https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/can-card-verification-codes-values-be-stored-in-digital-audio-recordings/).

A cleaner workflow uses the tee-sheet vendor's secure hosted checkout where available. The system can send the link, wait for a verified payment result, and only then confirm the booking. If the vendor cannot safely hold inventory through that step, the course needs a different workflow rather than a promise that outruns the system.

## What to verify before calling an integration “live”

A vendor logo is not enough. Before a course activates the integration, its actual configuration has to answer these questions:

- Which search, booking, lookup, change, and cancellation actions are supported?
- How are courses, rate types, customer types, and blocked inventory represented?
- What happens when inventory changes between search and booking?
- Are request keys or other idempotency protections supported?
- Can a booking be held during hosted payment, and for how long?
- Which vendor response is definitive evidence of success?
- How are outages, timeouts, rate limits, and partial failures surfaced?
- What audit data may be stored, and what sensitive data must be excluded?

Pinbound connects to EZLinks for availability, booking, lookup, changes, and cancellations. The tee sheet stays the source of truth, and a natural voice never gets to invent a transaction outcome.

## Sources

- [Microsoft: Asynchronous message-based communication and idempotent processing](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/asynchronous-message-based-communication)
- [PCI Security Standards Council: Card verification codes in audio recordings](https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/can-card-verification-codes-values-be-stored-in-digital-audio-recordings/)
