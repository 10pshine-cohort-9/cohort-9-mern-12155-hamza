# SonarQube Code Quality & Coverage Report

## Overview
This PR introduces comprehensive unit testing and Code Quality checks using SonarQube. We have successfully achieved a high standard of test coverage across both the client and server codebases.

## Key Metrics Achieved
- **Total Test Coverage**: `94.3%` across 557 lines of code.
- **Security**: `0` Open Issues, `0` Security Hotspots (Rating: **A**).
- **Reliability**: `0` Open Issues (Rating: **A**).
- **Maintainability**: Rating **A** (Only 7 minor code smells across 2.1k lines of code).
- **Duplications**: `0.0%` (0 duplicated blocks across the entire project).

## Coverage Breakdown
- **Server (`server/src`)**: `96.8%` Coverage
- **Client (`client/src`)**: `90.0%` Coverage

*(See attached screenshots for detailed SonarQube dashboard metrics and coverage breakdown per file).*

## Screenshots
> **Note to reviewer**: The SonarQube analysis evidence is located in the `docs/sonar-reports` directory.

- ![SonarQube Overall Dashboard](./sonar-reports/overview.png)
- ![Code Quality & Coverage Breakdown](./sonar-reports/code-breakdown.png)
- ![Detailed Measures](./sonar-reports/measures.png)
