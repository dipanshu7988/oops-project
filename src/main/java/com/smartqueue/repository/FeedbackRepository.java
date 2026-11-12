package com.smartqueue.repository;

import com.smartqueue.model.entity.Feedback;
import com.smartqueue.model.entity.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Optional<Feedback> findByQueueEntry(QueueEntry queueEntry);

    Optional<Feedback> findByQueueEntryTokenNumber(String tokenNumber);

    boolean existsByQueueEntryTokenNumber(String tokenNumber);

    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double getAverageRating();

    long countByRating(int rating);

    List<Feedback> findTop20ByOrderBySubmittedAtDesc();
}
