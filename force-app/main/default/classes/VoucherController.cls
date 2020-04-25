public with sharing class VoucherController {
    public VoucherController() {

    }

    @AuraEnabled(cacheable=true)
    public static List<Voucher__c> getVoucherList() {
        return [ SELECT Id, Voucher_Id__c, Name, Cost__c, Certification__c, Certification__r.Name, Validity__c, Active__c, Comments__c FROM Voucher__c ORDER BY Id LIMIT 10];
    }
}
