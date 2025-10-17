package com.ra.base_spring_boot;

import com.ra.base_spring_boot.dto.resp.PageResponse;
import com.ra.base_spring_boot.dto.resp.UserResponse;
import com.ra.base_spring_boot.model.*;
import com.ra.base_spring_boot.model.constants.RoleName;
import com.ra.base_spring_boot.model.constants.UserStatus;
import com.ra.base_spring_boot.repository.*;
import com.ra.base_spring_boot.services.impl.ManageUserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pagination, Search and Sort Tests")
class PaginationSortSearchTest {

    @Nested
    @DisplayName("User Management - Pagination, Search & Sort Tests")
    class UserServiceTests {

        @Mock
        private IManageUsersRepository userRepository;

        @InjectMocks
        private ManageUserServiceImpl userService;

        private List<User> testUsers;
        private Role userRole;

        @BeforeEach
        void setUp() {
            userRole = new Role();
            userRole.setRoleName(RoleName.ROLE_USER);

            testUsers = Arrays.asList(
                    createUser(1L, "Alice", "Johnson", "alice@test.com", UserStatus.ACTIVE),
                    createUser(2L, "Bob", "Smith", "bob@test.com", UserStatus.ACTIVE),
                    createUser(3L, "Charlie", "Brown", "charlie@test.com", UserStatus.BLOCKED),
                    createUser(4L, "David", "Wilson", "david@test.com", UserStatus.ACTIVE),
                    createUser(5L, "Eve", "Davis", "eve@test.com", UserStatus.BLOCKED)
            );
        }

        private User createUser(Long id, String firstName, String lastName, String email, UserStatus status) {
            User user = new User();
            user.setId(id);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setStatus(status);
            user.setPhone("012345678" + id);
            user.setAddress("Address " + id);
            user.setCreatedAt(new Date());
            user.setUpdatedAt(new Date());
            user.setRoles(Set.of(userRole));
            return user;
        }

        @Nested
        @DisplayName("Pagination Tests")
        class PaginationTests {

            @Test
            @DisplayName("Should return correct page data with valid page parameters")
            void shouldReturnCorrectPageData() {
                // Given
                Pageable pageable = PageRequest.of(0, 2); // Page 0, size 2
                List<User> pageContent = testUsers.subList(0, 2);
                Page<User> userPage = new PageImpl<>(pageContent, pageable, testUsers.size());

                when(userRepository.findBySearchAndStatus(null, null, pageable))
                        .thenReturn(userPage);

                // When
                PageResponse<UserResponse> result = userService.getAllUsers(null, null, null, pageable);

                // Then
                assertNotNull(result);
                assertEquals(5, result.getTotal()); // Total elements
                assertEquals(0, result.getPage()); // Current page
                assertEquals(2, result.getSize()); // Page size
                assertEquals(3, result.getTotalPages()); // Total pages
                assertEquals(2, result.getData().size()); // Current page content size
                assertTrue(result.isHasNext());
                assertFalse(result.isHasPrevious());

                // Verify correct users in page
                assertEquals("Alice", result.getData().get(0).getFirstName());
                assertEquals("Bob", result.getData().get(1).getFirstName());

                verify(userRepository).findBySearchAndStatus(null, null, pageable);
            }

            @Test
            @DisplayName("Should return empty page when page number exceeds limit")
            void shouldReturnEmptyPageWhenPageExceedsLimit() {
                // Given
                Pageable pageable = PageRequest.of(10, 2); // Page 10, size 2 (way beyond available data)
                Page<User> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, testUsers.size());

                when(userRepository.findBySearchAndStatus(null, null, pageable))
                        .thenReturn(emptyPage);

                // When
                PageResponse<UserResponse> result = userService.getAllUsers(null, null, null, pageable);

                // Then
                assertNotNull(result);
                assertEquals(5, result.getTotal()); // Total elements unchanged
                assertEquals(10, result.getPage()); // Requested page
                assertEquals(2, result.getSize()); // Page size
                assertEquals(3, result.getTotalPages()); // Total pages
                assertEquals(0, result.getData().size()); // No content
                assertFalse(result.isHasNext());
                assertTrue(result.isHasPrevious());

                verify(userRepository).findBySearchAndStatus(null, null, pageable);
            }

            @Test
            @DisplayName("Should handle different page sizes correctly")
            void shouldHandleDifferentPageSizes() {
                // Given - Page size of 3
                Pageable pageable = PageRequest.of(1, 3); // Page 1, size 3
                List<User> pageContent = testUsers.subList(3, 5); // Users 4-5
                Page<User> userPage = new PageImpl<>(pageContent, pageable, testUsers.size());

                when(userRepository.findBySearchAndStatus(null, null, pageable))
                        .thenReturn(userPage);

                // When
                PageResponse<UserResponse> result = userService.getAllUsers(null, null, null, pageable);

                // Then
                assertEquals(5, result.getTotal());
                assertEquals(1, result.getPage());
                assertEquals(3, result.getSize());
                assertEquals(2, result.getTotalPages());
                assertEquals(2, result.getData().size()); // Only 2 users left
                assertFalse(result.isHasNext());
                assertTrue(result.isHasPrevious());
            }
        }

        @Nested
        @DisplayName("Search Tests")
        class SearchTests {

            @Test
            @DisplayName("Should return correct results for valid search query")
            void shouldReturnCorrectResultsForValidSearch() {
                // Given
                String searchQuery = "alice";
                Pageable pageable = PageRequest.of(0, 10);
                List<User> searchResults = List.of(testUsers.get(0)); // Only Alice
                Page<User> userPage = new PageImpl<>(searchResults, pageable, 1);

                when(userRepository.findBySearchAndStatus(searchQuery, null, pageable))
                        .thenReturn(userPage);

                // When
                PageResponse<UserResponse> result = userService.getAllUsers(searchQuery, null, null, pageable);

                // Then
                assertNotNull(result);
                assertEquals(1, result.getTotal());
                assertEquals(1, result.getData().size());
                assertEquals("Alice", result.getData().get(0).getFirstName());
                assertEquals("alice@test.com", result.getData().get(0).getEmail());

                verify(userRepository).findBySearchAndStatus(searchQuery, null, pageable);
            }

            @Test
            @DisplayName("Should return empty results for search with no matches")
            void shouldReturnEmptyResultsForNoMatches() {
                // Given
                String searchQuery = "nonexistent";
                Pageable pageable = PageRequest.of(0, 10);
                Page<User> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

                when(userRepository.findBySearchAndStatus(searchQuery, null, pageable))
                        .thenReturn(emptyPage);

                // When
                PageResponse<UserResponse> result = userService.getAllUsers(searchQuery, null, null, pageable);

                // Then
                assertNotNull(result);
                assertEquals(0, result.getTotal());
                assertEquals(0, result.getData().size());
                assertFalse(result.isHasNext());
                assertFalse(result.isHasPrevious());

                verify(userRepository).findBySearchAndStatus(searchQuery, null, pageable);
            }

            @Test
            @DisplayName("Should handle case-insensitive search")
            void shouldHandleCaseInsensitiveSearch() {
                // Given
                String searchQuery = "ALICE";
                Pageable pageable = PageRequest.of(0, 10);
                List<User> searchResults = List.of(testUsers.get(0));
                Page<User> userPage = new PageImpl<>(searchResults, pageable, 1);

                when(userRepository.findBySearchAndStatus(searchQuery, null, pageable))
                        .thenReturn(userPage);

                // When
                PageResponse<UserResponse> result = userService.getAllUsers(searchQuery, null, null, pageable);

                // Then
                assertEquals(1, result.getTotal());
                assertEquals("Alice", result.getData().get(0).getFirstName());

                verify(userRepository).findBySearchAndStatus(searchQuery, null, pageable);
            }
        }

        @Nested
        @DisplayName("Filter Tests")
        class FilterTests {

            @Test
            @DisplayName("Should filter by status correctly")
            void shouldFilterByStatusCorrectly() {
                // Given
                String statusFilter = "ACTIVE";
                Pageable pageable = PageRequest.of(0, 10);
                List<User> activeUsers = testUsers.stream()
                        .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                        .toList();
                Page<User> userPage = new PageImpl<>(activeUsers, pageable, activeUsers.size());

                when(userRepository.findBySearchAndStatus(null, UserStatus.ACTIVE, pageable))
                        .thenReturn(userPage);

                // When
                PageResponse<UserResponse> result = userService.getAllUsers(null, statusFilter, null, pageable);

                // Then
                assertEquals(3, result.getTotal()); // 3 active users
                assertEquals(3, result.getData().size());
                result.getData().forEach(user ->
                        assertEquals(UserStatus.ACTIVE, user.getStatus())
                );

                verify(userRepository).findBySearchAndStatus(null, UserStatus.ACTIVE, pageable);
            }

            @Test
            @DisplayName("Should combine search and filter")
            void shouldCombineSearchAndFilter() {
                // Given
                String searchQuery = "o"; // Should match "Bob" and "Brown"
                String statusFilter = "ACTIVE";
                Pageable pageable = PageRequest.of(0, 10);
                List<User> filteredResults = List.of(testUsers.get(1)); // Only Bob (active)
                Page<User> userPage = new PageImpl<>(filteredResults, pageable, 1);

                when(userRepository.findBySearchAndStatus(searchQuery, UserStatus.ACTIVE, pageable))
                        .thenReturn(userPage);

                // When
                PageResponse<UserResponse> result = userService.getAllUsers(searchQuery, statusFilter, null, pageable);

                // Then
                assertEquals(1, result.getTotal());
                assertEquals("Bob", result.getData().get(0).getFirstName());
                assertEquals(UserStatus.ACTIVE, result.getData().get(0).getStatus());

                verify(userRepository).findBySearchAndStatus(searchQuery, UserStatus.ACTIVE, pageable);
            }
        }
    }


}