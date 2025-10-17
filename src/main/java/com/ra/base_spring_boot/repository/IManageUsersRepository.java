package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IManageUsersRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE (:search IS NULL OR u.email ILIKE %:search% OR " +
            "u.firstName ILIKE %:search% OR u.lastName ILIKE %:search%) " +
            "AND (:status IS NULL OR u.status = :status)")
    Page<User> findBySearchAndStatus(@Param("search") String search,
                                     @Param("status") UserStatus status,
                                     Pageable pageable);
}
