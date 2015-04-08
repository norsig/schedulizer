package com.yammer.schedulizer.auth;

import com.sun.jersey.api.client.Client;
import com.yammer.schedulizer.entities.Employee;
import com.yammer.schedulizer.managers.EmployeeManager;
import com.yammer.schedulizer.managers.UserManager;
import io.dropwizard.auth.AuthenticationException;

public class MockAuthenticator extends Authenticator {
    public MockAuthenticator(Client client, UserManager userManager, EmployeeManager employeeManager) {
        super(client, userManager, employeeManager, new MockExtAppAuthenticator(client), ExtAppAuthenticatorFactory.ExtAppType.yammer);
    }

    @Override
    protected Employee getTokenOwner(Credentials credentials) throws AuthenticationException {
        return employeeManager.safeGetByExtAppId(credentials.getExtAppId());
    }
}

class MockExtAppAuthenticator extends ExtAppAuthenticator {

    public MockExtAppAuthenticator(Client client) {
        super(client);
    }

    // will never be called because getTokenOwner from MockAuthenticator was overridden
    @Override
    public Employee getTokenOwner(String accessToken) {
        return null;
    }
}
