package com.yammer.schedulizer.auth;

public class Authentication {

    /**
     * Time (in days) after which we need to verify token authenticity with the external app
     */
    public static final int EXPIRATION_TIME = 1;

    /**
     * Scheme used in the standard http authorization header (case insensitive).
     * Syntax:
     *   Authorization: SC-AUTH access-token = <value>, ext-app-id = <value>
     */
    public static final String SCHEME = "SC-AUTH";

    /**
     * Parameters used in the standard http authorization header, after the scheme.
     * Syntax:
     *   Authorization: SC-AUTH access-token = <value>, ext-app-id = <value>
     */
    public static class Param {
        public static final String ACCESS_TOKEN = "access-token";
        public static final String EXT_APP_ID = "ext-app-id";
    }
    
    // Prevents instantiation
    private Authentication() {
        throw new AssertionError("Cannot instantiate object from " + this.getClass());
    }
}
