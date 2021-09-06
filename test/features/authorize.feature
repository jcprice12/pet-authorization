Feature: Authorize

  Scenario: Unauthenticated request leads to redirect with error
    When a request to get an auth token is made with the following parameters:
      | response_type | client_id | redirect_uri                    | scope  | prompt |
      | code          | 123       | https://foo.bar.com/hello-world | openid | none   |
    Then a redirect is made to "https://foo.bar.com/hello-world?error=login_required"