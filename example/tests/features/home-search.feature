Feature: Searching from the homepage

  Scenario: Simple Search

    Given I visit the home page
    When I search for 'Manchester'
    Then I should see 'Manchester Hotels' in the heading
