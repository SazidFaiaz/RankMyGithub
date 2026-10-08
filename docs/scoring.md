# Scoring methodology v1.0.0

GitRate summarizes publicly visible GitHub profile signals. It does not measure programming skill, private work, or a person's value.

| Category | Maximum | Current signals |
| --- | ---: | --- |
| Projects | 150 | Original public repository count, stars, and README/documentation quality only where evidence is available |
| Activity & Consistency | 350 | Original repositories updated in the last year; commit/contribution totals are unavailable through the API calls used here |
| Community Impact | 300 | Stars and forks on original public repositories with logarithmic scaling |
| Social Influence | 100 | Followers with logarithmic scaling; following is not rewarded |
| Languages | 50 | Distinct detected repository languages, excluding HTML, CSS, and Markdown |
| Account Longevity | 50 | Account age, reduced when no original repository has recent activity |

All scores are bounded and deterministic for a fixed data snapshot and reference time. The scoring version accompanies each result. GitHub's API request returns at most 100 repositories in this phase; metrics derived from those repositories are limited to that returned set. README presence and contribution graph totals are not queried, so the engine does not claim to know them.

The score is a summary of public signals, not a quality ranking of people or a measure of engineering ability.