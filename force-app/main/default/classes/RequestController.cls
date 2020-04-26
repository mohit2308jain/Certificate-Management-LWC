public with sharing class RequestController {
    public RequestController() {

    }

    @AuraEnabled(cacheable=true)
    public static List<Certification_Request__c> getRequestsList() {
        return [ SELECT Name, Certification__c, Certification__r.Name, Employee__c, Employee__r.Name, Voucher__c, Voucher__r.Name, Due_Date__c, Status__c, Comments__c FROM Certification_Request__c ORDER BY Id LIMIT 10];
    }
}