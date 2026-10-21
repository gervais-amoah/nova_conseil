from enum import Enum


# This is the single source of truth for Request Status
class RequestStatus(str, Enum):
    RECEIVED = "received"
    CLASSIFYING = "classifying"
    CLASSIFIED = "classified"
    UNCERTAIN = "uncertain"
    ASSIGNED = "assigned"
    RESOLVED = "resolved"
