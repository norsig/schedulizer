package com.yammer.schedulizer.resources;

import com.sun.jersey.core.util.MultivaluedMapImpl;
import com.yammer.schedulizer.entities.Employee;
import com.yammer.schedulizer.entities.Group;
import com.yammer.schedulizer.fixtures.GroupsFixture;
import com.yammer.schedulizer.test.TestUtils;
import org.junit.Test;

import javax.ws.rs.core.MultivaluedMap;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class GroupEmployeesResourceTest extends GetCreateDeleteResourceTest<Employee> {

    private String employeeName = "Luiz Filipe";
    private String imageUrlTemplate = "imageUrlTemplate";
    private String extAppId = TestUtils.nextExtAppId();
    private Group group;
    private Group otherGroup;


    @Override
    protected MultivaluedMap getSamplePostForm() {
        MultivaluedMapImpl values = new MultivaluedMapImpl();
        values.add("name",  employeeName);
        values.add("extAppId", extAppId);
        values.add("imageUrlTemplate", imageUrlTemplate);
        return values;
    }

    @Override
    protected String getResourcePath() {
        return String.format("/groups/%d/employees", group.getId());
    }

    @Override
    protected boolean checkCreatedEntity(Employee entity) {
        return entity.getName().equals(employeeName) &&
                entity.getImageUrlTemplate().equals(imageUrlTemplate) &&
                entity.getExtAppId().equals(extAppId);
    }

    @Override
    protected Class getEntityClass() {
        return Employee.class;
    }

    @Override
    protected Class getEntityArrayClass() {
        return Employee[].class;
    }

    @Override
    protected void initialize() {
        GroupsFixture groupsFixture = new GroupsFixture();
        groupsFixture.save(getSessionFactory());
        group = groupsFixture.getGroups().get(0);
        otherGroup = groupsFixture.getGroups().get(1);
    }

    @Test
    public void testCreateRetrieveFromOtherGroup() {
        Employee entity = (Employee) resource(getResourcePath()).entity(getSamplePostForm()).post(getEntityClass());
        assertNotNull(entity);
        assertTrue(checkCreatedEntity(entity));
        System.out.println(otherGroup.getId());
        List<Employee> entities =
                Arrays.asList(resource(String.format("/groups/%d/employees", otherGroup.getId())).get(Employee[].class));
        assertNotNull(entities);
        assertThat(entities.size(), equalTo(0));
    }
}
