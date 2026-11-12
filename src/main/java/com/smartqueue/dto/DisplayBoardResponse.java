package com.smartqueue.dto;

import com.smartqueue.model.enums.ServiceType;
import java.util.ArrayList;
import java.util.List;

public class DisplayBoardResponse {

    private ServiceType serviceType;
    private String serviceTypeName;
    private CurrentlyServingDto currentlyServing;
    private List<String> nextTokens = new ArrayList<>();
    private int averageWaitMinutes;

    public DisplayBoardResponse() {
    }

    public DisplayBoardResponse(ServiceType serviceType, String serviceTypeName,
                                CurrentlyServingDto currentlyServing, List<String> nextTokens,
                                int averageWaitMinutes) {
        this.serviceType = serviceType;
        this.serviceTypeName = serviceTypeName;
        this.currentlyServing = currentlyServing;
        this.nextTokens = nextTokens != null ? nextTokens : new ArrayList<>();
        this.averageWaitMinutes = averageWaitMinutes;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public String getServiceTypeName() {
        return serviceTypeName;
    }

    public void setServiceTypeName(String serviceTypeName) {
        this.serviceTypeName = serviceTypeName;
    }

    public CurrentlyServingDto getCurrentlyServing() {
        return currentlyServing;
    }

    public void setCurrentlyServing(CurrentlyServingDto currentlyServing) {
        this.currentlyServing = currentlyServing;
    }

    public List<String> getNextTokens() {
        return nextTokens;
    }

    public void setNextTokens(List<String> nextTokens) {
        this.nextTokens = nextTokens;
    }

    public int getAverageWaitMinutes() {
        return averageWaitMinutes;
    }

    public void setAverageWaitMinutes(int averageWaitMinutes) {
        this.averageWaitMinutes = averageWaitMinutes;
    }

    public static class CurrentlyServingDto {
        private String tokenNumber;
        private String counterName;

        public CurrentlyServingDto() {
        }

        public CurrentlyServingDto(String tokenNumber, String counterName) {
            this.tokenNumber = tokenNumber;
            this.counterName = counterName;
        }

        public String getTokenNumber() {
            return tokenNumber;
        }

        public void setTokenNumber(String tokenNumber) {
            this.tokenNumber = tokenNumber;
        }

        public String getCounterName() {
            return counterName;
        }

        public void setCounterName(String counterName) {
            this.counterName = counterName;
        }
    }
}
