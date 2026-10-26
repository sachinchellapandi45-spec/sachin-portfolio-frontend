package com.sachin.portfolio.repository;

import com.sachin.portfolio.model.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {

    long countByVisitedAtAfter(LocalDateTime dateTime);

    long countDistinctIpAddressByVisitedAtAfter(LocalDateTime dateTime);

    @Query("SELECT COUNT(DISTINCT v.ipAddress) FROM Visitor v")
    long countDistinctIpAddresses();

    @Query(value = """
        SELECT DATE(visited_at) as date, COUNT(*) as count
        FROM visitors
        WHERE visited_at >= :from
        GROUP BY DATE(visited_at)
        ORDER BY DATE(visited_at) ASC
        """, nativeQuery = true)
    List<Map<String, Object>> getDailyStats(LocalDateTime from);

    @Query(value = """
        SELECT device_type as label, COUNT(*) as count
        FROM visitors
        GROUP BY device_type
        ORDER BY count DESC
        """, nativeQuery = true)
    List<Map<String, Object>> getDeviceStats();

    @Query(value = """
        SELECT browser as label, COUNT(*) as count
        FROM visitors
        GROUP BY browser
        ORDER BY count DESC
        LIMIT 8
        """, nativeQuery = true)
    List<Map<String, Object>> getBrowserStats();

    List<Visitor> findTop20ByOrderByVisitedAtDesc();
}
