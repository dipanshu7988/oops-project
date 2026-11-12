package com.smartqueue.service;

import com.smartqueue.dto.DisplayBoardResponse;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.repository.QueueEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional(readOnly = true)
public class DisplayBoardService {

    private final QueueEntryRepository queueEntryRepository;
    private final QueueService queueService;

    public DisplayBoardService(QueueEntryRepository queueEntryRepository, QueueService queueService) {
        this.queueEntryRepository = queueEntryRepository;
        this.queueService = queueService;
    }

    public DisplayBoardResponse getDisplayForService(ServiceType serviceType) {
        // Find currently serving token for this service
        List<QueueEntry> servingList = queueEntryRepository.findByServiceTypeAndStatus(serviceType, QueueStatus.SERVING);

        DisplayBoardResponse.CurrentlyServingDto servingDto = null;
        if (!servingList.isEmpty()) {
            QueueEntry serving = servingList.get(0);
            String counterName = serving.getAssignedCounter() != null
                    ? serving.getAssignedCounter().getCounterName()
                    : "Counter";
            servingDto = new DisplayBoardResponse.CurrentlyServingDto(serving.getTokenNumber(), counterName);
        }

        // Find next waiting tokens sorted by priority and arrival time
        List<QueueEntry> waiting = queueEntryRepository.findByServiceTypeAndStatusIn(
                serviceType,
                List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN)
        );

        // Sort by priority value ASC, joinedAt ASC
        List<QueueEntry> sortedWaiting = new ArrayList<>(waiting);
        sortedWaiting.sort(Comparator.comparing(QueueEntry::getPriority, Comparator.comparingInt(p -> p.getValue()))
                .thenComparing(QueueEntry::getJoinedAt));

        // Privacy rule: Only token numbers are exposed to public screens
        List<String> nextTokens = sortedWaiting.stream()
                .limit(5)
                .map(QueueEntry::getTokenNumber)
                .toList();

        double avgServiceTime = queueService.getAverageServiceTime(serviceType);
        int avgWait = (int) Math.round(avgServiceTime * Math.max(1, waiting.size()));

        return new DisplayBoardResponse(
                serviceType,
                serviceType.getDisplayName(),
                servingDto,
                nextTokens,
                avgWait
        );
    }

    public List<DisplayBoardResponse.CurrentlyServingDto> getCurrentServingAll() {
        List<QueueEntry> serving = queueEntryRepository.findByStatus(QueueStatus.SERVING);
        return serving.stream().map(e -> {
            String counterName = e.getAssignedCounter() != null
                    ? e.getAssignedCounter().getCounterName()
                    : "Desk";
            return new DisplayBoardResponse.CurrentlyServingDto(e.getTokenNumber(), counterName);
        }).toList();
    }

    public Map<String, List<String>> getNextTokensAll() {
        Map<String, List<String>> map = new LinkedHashMap<>();
        for (ServiceType type : ServiceType.values()) {
            List<QueueEntry> waiting = queueEntryRepository.findByServiceTypeAndStatusIn(
                    type,
                    List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN)
            );
            List<QueueEntry> sortedList = new ArrayList<>(waiting);
            sortedList.sort(Comparator.comparing(QueueEntry::getPriority, Comparator.comparingInt(p -> p.getValue()))
                    .thenComparing(QueueEntry::getJoinedAt));

            List<String> tokens = sortedList.stream().limit(5).map(QueueEntry::getTokenNumber).toList();
            map.put(type.name(), tokens);
        }
        return map;
    }
}
