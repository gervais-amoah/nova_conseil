Feature: Server-Mediated AI Categorization and Human Correction
  As the system and internal staff
  I want incoming requests to be automatically categorized by AI with strict fallback and human oversight
  So that categorization is efficient while maintaining human accountability

  Scenario: Successful server-mediated AI categorization
    Given a new request has been submitted with message "We need help optimizing our sales pipeline."
    When the server invokes the AI categorization service with the fixed taxonomy
    Then the AI service should return a valid category from ["Consulting", "Coaching & Training", "Sales", "Support"]
    And the system should store the AI suggestion in `ai_suggested_category`
    And set the request status to "pending_review"

  Scenario: Graceful handling of AI service failure or timeout
    Given a new request has been submitted
    When the AI categorization service fails or times out
    Then the system must not lose or drop the request data
    And the request should be marked with status "pending_review" and `ai_suggested_category` as "uncertain"
    And internal staff should be able to process the request manually

  Scenario: Staff member corrects or confirms an AI categorization
    Given an authenticated staff member is viewing a request with AI suggestion "Consulting"
    When the staff member overrides the category to "Coaching & Training" and saves
    Then the system should preserve the original AI suggestion in `ai_suggested_category`
    And update the `final_category` to "Coaching & Training"
    And set `human_corrected_flag` to true