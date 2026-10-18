Feature: Internal Dashboard and Request Processing
  As an internal staff member
  I want to securely authenticate, view, filter, and process incoming requests
  So that client inquiries are handled efficiently through their lifecycle

  Scenario: Unauthorized access attempt to internal dashboard
    Given an unauthenticated user attempts to access "/admin/dashboard"
    Then the system should redirect them to the login page or return a 401 Unauthorized response

  Scenario: Staff member views and updates a request lifecycle status
    Given an authenticated staff member is on the internal dashboard
    When they select a request in "pending_review" status
    And they assign the request to themselves and update status to "processing"
    Then the request status should update to "processing" in the database
    And an audit log or timestamp of the status change should be recorded