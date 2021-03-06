package com.yammer.schedulizer.resources;

import com.yammer.schedulizer.auth.Authorize;
import com.yammer.schedulizer.auth.Role;
import com.yammer.schedulizer.entities.Employee;
import com.yammer.schedulizer.entities.Group;
import com.yammer.schedulizer.entities.User;
import com.yammer.schedulizer.managers.EmployeeManager;
import com.yammer.schedulizer.utils.ResourceUtils;
import io.dropwizard.hibernate.UnitOfWork;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Set;

@Path("/employees")
@Produces(MediaType.APPLICATION_JSON)
public class EmployeesResource {

    private EmployeeManager employeeManager;

    public EmployeesResource(EmployeeManager employeeManager) {
        this.employeeManager = employeeManager;
    }

    @GET
    @Path("/{employee_id}/groups")
    @UnitOfWork
    public Response getEmployeeGroups(
            @PathParam("employee_id") long employeeId) {

        Employee employee = employeeManager.getById(employeeId);
        Set<Group> groups = employee.getGroups();
        return Response.ok().entity(groups).build();
    }

    @GET
    @Path("/{employee_id}")
    @UnitOfWork
    public Response getEmployee(
            @PathParam("employee_id") long employeeId) {

        Employee employee = employeeManager.getById(employeeId);
        return Response.ok().entity(employee).build();
    }

    @POST
    @Path("/{employee_id}")
    @UnitOfWork
    public Response updateEmployee(
            @Authorize({Role.ADMIN, Role.MEMBER}) User user,
            @PathParam("employee_id") long employeeId,
            @FormParam("name") String name,
            @FormParam("imageUrlTemplate") String imageUrlTemplate) {

        ResourceUtils.checkConflictFree(user.getEmployee().getId() == employeeId, User.class);
        employeeManager.updateByEmployeeId(employeeId, (Employee e) -> {
            e.setName(name);
            e.setImageUrlTemplate(imageUrlTemplate);
        });
        return Response.ok().build();
    }
}
