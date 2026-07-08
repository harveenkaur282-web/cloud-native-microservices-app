## 1. Why do we generally not commit __pycache__ files?
__pycache__ contains compiled Python bytecode (.pyc files).Python generates these automatically
to make next runs faster. they are machine-generated, env-dependent, and can be recreated 
automatically. We dont really need them so they dont belong in source control. 

## 2. Should the database allow two users with the same email?
## 3. Why do we hash passwords instead of encrypting them?
## 4. What problem does docker actually solve?
Docker solves the problem of inconsistent software environments by packaging an application together with its runtime, dependencies, libraries, and configuration into a portable container image. This ensures the application behaves consistently across development, testing, and production environments. Docker also simplifies deployment, isolates dependencies between applications, enables reproducible builds, and provides a standardized unit that orchestration platforms like Kubernetes can easily deploy and scale.