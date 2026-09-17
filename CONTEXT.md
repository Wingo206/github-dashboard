# GitHub Dashboard

A personal dashboard over one GitHub repository: pull requests, branches, and recent activity.

## Language

**Snapshot**:
The last known result a dashboard panel can show: nothing yet, a list, or an error.
_Avoid_: Loading state, ready state, store status

**In-flight**:
A fetch that has started and not yet finished. Independent of whether a snapshot exists.
_Avoid_: Refreshing (as a panel status), background loading state
