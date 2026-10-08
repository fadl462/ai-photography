# Photographer Intelligence — V47.6

## Purpose
Turn repeated photographer decisions into explicit, auditable preference signals without pretending that UI state is model training.

## Learning signals
1. Style DNA reference analysis
2. Frame approval
3. Frame rejection
4. Frame edit feedback
5. Completed project outcomes
6. Explicit preference records with confidence

## Safety rule
A minimum of five explicit approval/rejection signals is required before the gateway reports the profile as ready for stronger personalization. The AI Director must continue to treat memory as a preference layer and preserve image-specific judgment.

## Project memory
Each completed production records: project name, shoot profile, frame count, keeper count, quality score and Style DNA score. The latest 30 project records are retained by the prototype profile store; the Studio displays the latest eight.

## Production path
Understand → Cull → Develop → Retouch → Style DNA → Quality Guard → Self-Correct → Deliver → Record Outcome

## Production deployment
The prototype uses server-side JSON files. A production deployment should replace this store with an authenticated database, encryption at rest, tenant isolation, retention controls and explicit user export/deletion controls.
