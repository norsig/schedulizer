package com.yammer.stresstime.managers;

import com.google.common.collect.Lists;
import com.yammer.stresstime.entities.Employee;
import com.yammer.stresstime.entities.Group;
import com.yammer.stresstime.entities.User;
import com.yammer.stresstime.fixtures.GroupsFixture;
import com.yammer.stresstime.test.DatabaseTest;
import com.yammer.stresstime.test.TestUtils;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.List;

import static com.yammer.stresstime.test.TestUtils.assertCauses;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

public class GroupManagerTest extends BaseManagerTest<Group> {

    private GroupManager groupManager;
    private List<Group> testGroups;

    @Override
    protected EntityManager<Group> getEntityManager() {
        return groupManager;
    }

    @Override
    protected List<Group> getEntities() {
        return testGroups;
    }

    @Override
    protected void initialize() {
        groupManager = new GroupManager(getSessionFactory());
        GroupsFixture groupsFixture = new GroupsFixture();
        testGroups = groupsFixture.getGroups();
    }

    @Override
    protected void clean() {}
}