package com.yammer.stresstime.auth;

import com.sun.jersey.api.model.Parameter;
import com.sun.jersey.core.spi.component.ComponentContext;
import com.sun.jersey.core.spi.component.ComponentScope;
import com.sun.jersey.spi.inject.Injectable;
import com.sun.jersey.spi.inject.InjectableProvider;
import io.dropwizard.auth.Authenticator;

public class StresstimeAuthorizeProvider<T> implements InjectableProvider<Authorize, Parameter> {

    private Authenticator<? super StresstimeCredentials, T> authenticator;

    public StresstimeAuthorizeProvider(Authenticator<? super StresstimeCredentials, T> authenticator) {
        this.authenticator = authenticator;
    }

    @Override
    public ComponentScope getScope() {
        return ComponentScope.PerRequest;
    }

    @Override
    public Injectable getInjectable(ComponentContext ic, Authorize authorize, Parameter parameter) {
        return new StresstimeAuthorizeInjectable<>(authenticator, authorize.value());
    }
}
