Feature: Client and Project Management
  As an internal staff member
  I want to manage client records and link them to requests and projects
  So that long-term consulting engagements are properly tracked

  Scenario: Create a new client record and associate a request
    Given an authenticated staff member is viewing client management
    When they create a client with name "Global Logistics Inc." and primary contact "Bob Smith"
    And they link an existing request to this client record
    Then the request should be successfully associated with "Global Logistics Inc."