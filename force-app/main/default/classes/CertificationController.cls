public with sharing class CertificationController {
    public CertificationController() {

    }

    @AuraEnabled(cacheable=true)
    public static List<Certification__c> getCertificationList() {
        return [ SELECT Id, Cert_Id__c, Name, Cost__c, Comments__c FROM Certification__c ORDER BY Id LIMIT 10];
    }

    @AuraEnabled(cacheable=true)
    public static List<Certification__c> getCertification(String searchTerm) {
        String searchTermLike = '%'+searchTerm+'%';
        return [ SELECT Id, Cert_Id__c, Name, Cost__c, Comments__c FROM Certification__c WHERE Name LIKE :searchTermLike];
    }
}