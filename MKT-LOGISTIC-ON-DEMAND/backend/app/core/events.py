class EventType:
    """Event type constants."""
    LOAD_CREATED = "load_created"
    LOAD_INTERESTED = "load_interested"
    LOAD_INTEREST_ACCEPTED = "load_interest_accepted"
    LOAD_ASSIGNED = "load_assigned"
    LOAD_COMPLETED = "load_completed"
    LOAD_CANCELLED = "load_cancelled"


class LoadStatus:
    """Load status constants."""
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class UserRole:
    """User role constants."""
    ADMIN = "admin"
    CARRIER = "carrier"
    USER = "user"
