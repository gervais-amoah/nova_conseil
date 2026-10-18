Feature: Public Request Intake
  As a public visitor
  I want to submit a business consulting or coaching request securely
  So that Novae Conseil staff can review and process my inquiry

  Scenario: Successfully submit a valid consulting request
    Given the public visitor is on the Novae Conseil request page
    When they enter "Acme Corp" as the company name
    And they enter "Jane Doe" as the contact name
    And they enter "jane@acmecorp.com" as the email
    And they select "Consulting" as the requested inquiry type
    And they enter "We need help scaling our cloud infrastructure." as the message
    And they submit the request form
    Then the system should display a success confirmation message with a reference ID
    And the request should be persisted in the database with status "pending_classification"

  Scenario Outline: Reject invalid or incomplete form submissions
    Given the public visitor is on the Novae Conseil request page
    When they submit the request with company "<company>", email "<email>", and message "<message>"
    Then the system should reject the submission with a validation error for "<invalid_field>"
    And no request should be created in the database

    Examples:
      | company   | email            | message                   | invalid_field |
      |           | jane@acmecorp.com | Valid message here        | company       |
      | Acme Corp | invalid-email    | Valid message here        | email         |
      | Acme Corp | jane@acmecorp.com | Too short                 | message       |

  Scenario: Enforce rate limits on public submission
    Given the visitor has submitted 30 requests from their IP address within the last 24 hours
    When they attempt to submit one more request
    Then the system should reject the submission with a 429 Too Many Requests error
    And display a message about daily submission limits