Feature: Authorize

  Scenario: Unauthenticated request leads to redirect with error
    Given client with ID "123" and redirect URI "https://foo.bar.com/hello-world"
    When client makes a request to the authorize endpoint with the following parameters for resource owner "john@gmail.com":
      | response_type | client_id | redirect_uri                    | scope  | prompt |
      | code          | 123       | https://foo.bar.com/hello-world | openid | none   |
    Then a redirect is made to "https://foo.bar.com/hello-world" with the following params:
      | name  | value          |
      | error | login_required |

  Scenario: Request with login prompt leads to redirect to login page
    Given client with ID "123" and redirect URI "https://foo.bar.com/hello-world"
    When client makes a request to the authorize endpoint with the following parameters:
      | response_type | client_id | redirect_uri                    | scope  | prompt |
      | code          | 123       | https://foo.bar.com/hello-world | openid | login  |
    Then a redirect is made to "http://localhost:3000/users/login" with the following params:
      | name         | value                                                                                                                           |
      | redirect_uri | .+\/authorize\?response_type=code&client_id=123&redirect_uri=https%3A%2F%2Ffoo\.bar\.com%2Fhello-world&scope=openid&prompt=none |

  Scenario: Authenticated request for scope not consented to leads to redirect with error
    Given client with ID "123" and redirect URI "https://foo.bar.com/hello-world"
    Given resource owner registers with email "john@gmail.com" and password "password123"
    Given resource owner logs in with email "john@gmail.com" and password "password123"
    When client makes a request to the authorize endpoint with the following parameters for resource owner "john@gmail.com":
      | response_type | client_id | redirect_uri                    | scope  | prompt |
      | code          | 123       | https://foo.bar.com/hello-world | openid | none   |
    Then a redirect is made to "https://foo.bar.com/hello-world" with the following params:
      | name  | value            |
      | error | consent_required |

  Scenario: Authenticated request with consent prompt leads to redirect to consent page
    Given client with ID "123" and redirect URI "https://foo.bar.com/hello-world"
    Given resource owner registers with email "john@gmail.com" and password "password123"
    Given resource owner logs in with email "john@gmail.com" and password "password123"
    When client makes a request to the authorize endpoint with the following parameters for resource owner "john@gmail.com":
      | response_type | client_id | redirect_uri                    | scope        | prompt  |
      | code          | 123       | https://foo.bar.com/hello-world | openid email | consent |
    Then a redirect is made to "http://localhost:3000/users/consent" with the following params:
      | name         | value                                                                                                                                  |
      | scope        | openid email                                                                                                                           |
      | client_id    | 123                                                                                                                                    |
      | redirect_uri | .+\/authorize\?response_type=code&client_id=123&redirect_uri=https%3A%2F%2Ffoo\.bar\.com%2Fhello-world&scope=openid\+email&prompt=none |

  Scenario: Authenticated request for consented scopes leads to redirect with auth code
    Given client with ID "123" and redirect URI "https://foo.bar.com/hello-world"
    Given resource owner registers with email "john@gmail.com" and password "password123"
    Given resource owner logs in with email "john@gmail.com" and password "password123"
    Given resource owner with email "john@gmail.com" consents to the following scopes for client "123":
      | scope  |
      | openId |
      | email  |
    When client makes a request to the authorize endpoint with the following parameters for resource owner "john@gmail.com":
      | response_type | client_id | redirect_uri                    | scope        | prompt |
      | code          | 123       | https://foo.bar.com/hello-world | openid email | none   |
    Then a redirect is made to "https://foo.bar.com/hello-world" with the following params:
      | name | value         |
      | code | [A-Za-z0-9-]+ |