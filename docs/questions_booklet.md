## 1. Why do we generally not commit __pycache__ files?
__pycache__ contains compiled Python bytecode (.pyc files).Python generates these automatically
to make next runs faster. they are machine-generated, env-dependent, and can be recreated 
automatically. We dont really need them so they dont belong in source control. 

## 2. Should the database allow two users with the same email?
## 3. Why do we hash passwords instead of encrypting them?