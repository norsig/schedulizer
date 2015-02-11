package com.yammer.stresstime.test;

import com.google.common.base.Throwables;
import org.junit.Assert;

import java.util.concurrent.atomic.AtomicInteger;

import static junit.framework.TestCase.fail;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.instanceOf;

public class TestUtils {

    private static AtomicInteger counter = new AtomicInteger(0);

    /**
     * Useful for retrieving a unique number within the whole test suite.
     * @return An integer unique within this test session context
     */
    public static int nextInt() {
        return counter.getAndIncrement();
    }

    public static String nextYammerId() {
        /* TODO: Create yammer id own counter to prevent premature overflow (really?) */
        return "<yid-" + nextInt() + ">";
    }

    public static void assertCauses(Class<? extends Throwable> exception, Runnable runnable) {
        try {
            runnable.run();
            fail("Expected exception " + exception.getSimpleName() + " but none was thrown");
        } catch (Throwable e) {
            /* TODO: Meaningful message */
            Assert.assertThat(Throwables.getCausalChain(e), hasItem(instanceOf(exception)));
        }
    }

    public static void assertThrows(Class<? extends Throwable> exception, Runnable runnable) {
        try {
            runnable.run();
            fail("Expected exception " + exception.getSimpleName() + " but none was thrown");
        } catch (Throwable e) {
            if (!exception.isInstance(e)) {
                throw e;
            }
        }
    }

    // Prevents instantiation
    private TestUtils() {
        throw new AssertionError("Cannot instantiate object from " + this.getClass());
    }
}