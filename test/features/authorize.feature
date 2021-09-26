Feature: Authorize

  Scenario: Unauthenticated request leads to redirect with error
    When client makes a request to the authorize endpoint with the following parameters for resource owner "john@gmail.com":
      | response_type | client_id | redirect_uri                    | scope  | prompt |
      | code          | 123       | https://foo.bar.com/hello-world | openid | none   |
    Then a redirect is made to "https://foo.bar.com/hello-world" with "login_required" error

  Scenario: Authenticated request for scope not consented to leads to redirect with error
    Given resource owner registers with email "john@gmail.com" and password "password123"
    Given resource owner logs in with email "john@gmail.com" and password "password123"
    When client makes a request to the authorize endpoint with the following parameters for resource owner "john@gmail.com":
      | response_type | client_id | redirect_uri                    | scope  | prompt |
      | code          | 123       | https://foo.bar.com/hello-world | openid | none   |
    Then a redirect is made to "https://foo.bar.com/hello-world" with "access_denied" error

  Scenario: Authenticated request for consented scopes leads to redirect with auth code
    Given resource owner registers with email "john@gmail.com" and password "password123"
    Given resource owner logs in with email "john@gmail.com" and password "password123"
    Given resource owner with email "john@gmail.com" consents to the following scopes for client "123":
      | scope   |
      | openId  |
      | profile |
    When client makes a request to the authorize endpoint with the following parameters for resource owner "john@gmail.com":
      | response_type | client_id | redirect_uri                    | scope          | prompt |
      | code          | 123       | https://foo.bar.com/hello-world | openid profile | none   |
    Then a redirect is made to "https://foo.bar.com/hello-world" with an auth code