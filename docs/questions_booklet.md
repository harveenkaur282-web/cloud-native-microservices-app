## 1. Why do we generally not commit __pycache__ files?
__pycache__ contains compiled Python bytecode (.pyc files).Python generates these automatically
to make next runs faster. they are machine-generated, env-dependent, and can be recreated 
automatically. We dont really need them so they dont belong in source control. 

## 2. Should the database allow two users with the same email?
## 3. Why do we hash passwords instead of encrypting them?
## 4. What problem does docker actually solve?
Docker solves the problem of inconsistent software environments by packaging an application together with its runtime, dependencies, libraries, and configuration into a portable container image. This ensures the application behaves consistently across development, testing, and production environments. Docker also simplifies deployment, isolates dependencies between applications, enables reproducible builds, and provides a standardized unit that orchestration platforms like Kubernetes can easily deploy and scale.

## Why is creating a new database session for each request better than having one global database connection?
Each API request should get its own database session because:
Requests are independent.
One user's transaction shouldn't interfere with another's.
Sessions can be committed/rolled back independently.
After the request finishes, the session is closed and resources are released.

## why BASE?
Base is the common parent class that tells sqlalchemy that these python classes represent database tables

## single responsibility principle
database.py - configure and provide database access

## why ph no. unique?
for now- I assumed one account corresponds to one phone number for authentication and communication. In another business domain, such as a family account system, this constraint might be relaxed.

## why it's called models.py?
domain modeling, business entities, it models what data exists, the constraints, relationships and how it maps the entities to the database table through the ORM. 

## VERY IMP POINT- main.py
SQLAlchemy stores metadata for every model that inherits from Base. When Base.metadata.create_all() is called, it iterates over all registered models and creates the corresponding database tables. That's why we don't need to manually create each table.




