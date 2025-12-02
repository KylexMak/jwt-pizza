# Incident: 2025-12-02 13-23-15

## Summary

Between the hour of 13:23 and 13:30 on 12-02-2025, 2-3 users encountered pizza creation failures on their orders. The event was triggered by a chaos monkey at 13:23. The monkey entered the system and cause all calls to the factory to fail. As such, there were no pizzas being created as the factory was not receiving the request or verifying it.

## Detection

This incident was detected when the Kyle Mak checked the Pizza dashboard. Since there is only one person on the team, no other individuals were notified.
To improve response time, the alerts will need to be changed to notify all members on the team. The previous was checking for pizza failure over the time span of 5 minutes. Kyle Mak will change the rate to look for an increase of pizza failure greater than 3 over the time span of 1 minute.

## Impact

For 7 minutes between 13:23 and 13:30 on 12-02-2025, our users experienced a failure of pizza orders.
This incident affected 2-3 customers (100% OF USERS), who experienced pizza creation failures.
No tickets or compliants were submitted.

## Timeline

All times are UTC.

- _13:23_ - Chaos Monkey was injected
- _13:24_ - Pizza creation failures spiked
- _13:25_ - Kyle Mak looked at the pizza creation failure graph
- _13:26_ - Kyle Mak checked the revenue of the business and verified that all pizzas were failing to be created.
- _13:27_ - Kyle Mak checked the logs
- _13:29_ - Kyle Mak found the support link to get rid of the Chaos Monkey
- _13:30_ - Kyle Mak removed the Chaos Monkey
- _13:31_ - Kyle Mak changed the alerts to activate on a more accurate measurement threshold

## Response

Kyle Mak responded to the incident. They checked the number of pizza creation failures and the anount fo revenue being lost to confirm that customers were not able to order pizzas. Then, he checked the logs to see what was failing. An obstacle that caused a small delay to responding was having the log table refresh every 5 seconds. It made it difficult to pinpoint a specific log. He changed it to 5 minute long refresh cycles and found a log that was responding with 500 status code. Afer reading the log, there was a support link in the log that got rid of the chaos monkey.

## Root cause

A chaos monkey was injected into the system.

## Resolution

> [!NOTE]
> Describe how the service was restored and the incident was deemed over. Detail how the service was successfully restored and you knew how what steps you needed to take to recovery.
> Depending on the scenario, consider these questions: How could you improve time to mitigation? How could you have cut that time by half?

The service was restored after visiting the support link that got rid of the monkey. Visiting the link was apparent as the description of the link told us that the Chaos Monkey would be removed when clicked. I could cut the response time in half by having better alerts as well as stronger security. Another way to avoid errors of third party dependency failures is to create things in house.

## Prevention

While there is no way to control whether a third party dependency crashes, we can control how our application responds. A better way to respond might be using a strategy like the circuit breaker pattern. The Circuit Breaker pattern functions as an automated safety switch within software architecture, designed to prevent cascading failures. It wraps calls to external dependencies, and if a service fails repeatedly—such as by timing out or returning 500 errors—the breaker trips to an Open state. This state immediately blocks subsequent requests without attempting to contact the failing dependency, thereby preserving system resources and preventing thread pool exhaustion. After a designated cooling-off period, the breaker transitions to a Half-Open state to tentatively allow a single test request; success resets the breaker to Closed (normal operation), while failure trips it back to Open.

## Action items

Kyle Mak should change the alerts so it triggers on an accurate measurement. 