"""GraphQL package initialization.

Avoid importing heavy modules (like schema) at package import time to prevent
potential circular dependencies when other modules import submodules such as
`app.graphql.pubsub`.

Import `schema` and `graphql_router` directly from `app.graphql.schema` where
needed instead of exposing them here.
"""

__all__ = []