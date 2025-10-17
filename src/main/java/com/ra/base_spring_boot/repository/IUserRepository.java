package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<User, Long>
{
    Long countByStatus(UserStatus status);
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = 'BLOCKED' AND (u.banUntil IS NULL OR u.banUntil > :currentDate)")
    Long countBlockedUsers(@Param("currentDate") Date currentDate);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
