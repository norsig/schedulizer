package com.yammer.stresstime.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableSet;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.hibernate.annotations.Type;
import org.joda.time.LocalDate;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Entity
@Table(name = "assignable_days")
public class AssignableDay {

    public  AssignableDay() {
        // Required by Hibernate
    }

    public AssignableDay(Group group, LocalDate date) {
        setGroup(group);
        setDate(date);
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "date")
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentLocalDate")
    @NotNull
    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    @OneToMany(mappedBy = "assignableDay")
    @Cascade({CascadeType.DELETE})
    private Set<Assignment> assignments;

    public long getId() {
        return id;
    }

    @JsonIgnore
    public LocalDate getDate() {
        return date;
    }

    @JsonProperty("date")
    public String getDateStr() {
        return date.toString();
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    @JsonIgnore
    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public Set<Assignment> getAssignments() {
        return ImmutableSet.copyOf(assignments);
    }

    public void setAssignments(Set<Assignment> assignments) {
        this.assignments = ImmutableSet.copyOf(assignments);
    }
}
